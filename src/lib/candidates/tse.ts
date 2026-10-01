import "server-only";

import { ELECTION } from "@/config/election";
import type { PositionId } from "@/types/candidate";
import { POSITIONS } from "./positions";
import { indexByNumber, type CandidateIndex, type CandidateRecord } from "./record";

/** O Akamai na frente do DivulgaCandContas recusa clientes sem cabeçalhos de navegador. */
export const TSE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
} as const;

/** Pode apontar para um espelho/proxy caso o TSE bloqueie a região do servidor. */
const TSE_BASE_URL = process.env.TSE_BASE_URL ?? ELECTION.tseBaseUrl;
const REQUEST_TIMEOUT_MS = 8_000;
/** As listas são grandes (até ~2,5 MB) e mudam pouco: ficam em memória por 30 minutos. */
const LIST_TTL_MS = 30 * 60 * 1_000;

interface TseCandidate {
  id: number;
  numero: number;
  nomeUrna: string;
  partido: { sigla: string | null } | null;
  descricaoSituacao: string | null;
  candidatoApto: boolean | null;
}

/** Cache entre requisições: dado público, chaveado por cargo — seguro em escopo de módulo. */
const listCache = new Map<PositionId, { expiresAt: number; index: Promise<CandidateIndex> }>();

/** Unidade eleitoral nas URLs do TSE: "BR" para presidente, UF da eleição para os demais. */
export function electoralUnit(position: PositionId): string {
  return POSITIONS[position].scope === "national" ? "BR" : ELECTION.uf;
}

export function tsePhotoUrl(unit: string, candidateId: string): string {
  return `${TSE_BASE_URL}/arquivo/img/${ELECTION.tseElectionId}/${candidateId}/${unit}`;
}

function toRecord(candidate: TseCandidate): CandidateRecord {
  return {
    number: candidate.numero,
    id: String(candidate.id),
    name: candidate.nomeUrna,
    party: candidate.partido?.sigla ?? "",
    fit: candidate.candidatoApto !== false,
    status: candidate.descricaoSituacao ?? "",
  };
}

async function fetchIndex(position: PositionId): Promise<CandidateIndex> {
  const { tseCode } = POSITIONS[position];
  const url = `${TSE_BASE_URL}/v1/candidatura/listar/${ELECTION.year}/${electoralUnit(position)}/${ELECTION.tseElectionId}/${tseCode}/candidatos`;

  // Sem cache do Next: a lista passa do limite de 2 MB do data cache, então usamos o cache em memória.
  const response = await fetch(url, {
    headers: TSE_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`TSE respondeu HTTP ${response.status} (${url})`);

  const body = (await response.json()) as { candidatos?: TseCandidate[] };
  const candidates = body.candidatos ?? [];
  if (candidates.length === 0) throw new Error(`TSE retornou lista vazia (${url})`);
  return indexByNumber(candidates.map(toRecord));
}

/** Índice número → candidaturas do cargo, com cache em memória e deduplicação de buscas simultâneas. */
export function getTseIndex(position: PositionId): Promise<CandidateIndex> {
  const cached = listCache.get(position);
  if (cached && cached.expiresAt > Date.now()) return cached.index;

  const index = fetchIndex(position);
  listCache.set(position, { expiresAt: Date.now() + LIST_TTL_MS, index });
  // Falhas não ficam em cache: a próxima busca tenta o TSE de novo.
  index.catch(() => {
    if (listCache.get(position)?.index === index) listCache.delete(position);
  });
  return index;
}
