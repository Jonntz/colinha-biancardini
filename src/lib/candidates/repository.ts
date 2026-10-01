import "server-only";

import type { Candidate, CandidateSource, PositionId } from "@/types/candidate";
import { formatCandidateName } from "./format";
import { pickCandidate, type CandidateRecord } from "./record";
import { getSnapshotIndex } from "./snapshot";
import { electoralUnit, getTseIndex } from "./tse";

/** Depois de uma falha do TSE, usa só o snapshot por 1 min para não pagar o timeout em cada busca. */
const TSE_COOLDOWN_MS = 60_000;
let tseCooldownUntil = 0;

export interface CandidateLookup {
  candidate: Candidate | null;
  source: CandidateSource;
}

function shouldQueryTse(): boolean {
  return process.env.CANDIDATE_SOURCE !== "snapshot" && Date.now() >= tseCooldownUntil;
}

function toCandidate(position: PositionId, record: CandidateRecord | null): Candidate | null {
  if (!record) return null;
  return {
    number: String(record.number),
    name: formatCandidateName(record.name),
    party: record.party,
    photoUrl: `/api/photos/${electoralUnit(position)}/${record.id}`,
    status: record.status,
    fit: record.fit,
  };
}

/** Busca no TSE ao vivo; se a API falhar, responde com o snapshot local. */
export async function findCandidate(position: PositionId, number: number): Promise<CandidateLookup> {
  if (shouldQueryTse()) {
    try {
      const index = await getTseIndex(position);
      return { candidate: toCandidate(position, pickCandidate(index.get(number))), source: "tse" };
    } catch (error) {
      tseCooldownUntil = Date.now() + TSE_COOLDOWN_MS;
      console.warn(`[candidates] TSE indisponível (${position}); usando snapshot local.`, error);
    }
  }

  const record = pickCandidate(getSnapshotIndex(position).get(number));
  return { candidate: toCandidate(position, record), source: "snapshot" };
}
