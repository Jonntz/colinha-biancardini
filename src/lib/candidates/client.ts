import type { CandidateLookupResponse, PositionId } from "@/types/candidate";

/** Cache da sessão: apagar e redigitar o mesmo número não refaz a requisição. */
const responses = new Map<string, CandidateLookupResponse>();

export async function fetchCandidate(
  position: PositionId,
  number: string,
  signal?: AbortSignal,
): Promise<CandidateLookupResponse> {
  const key = `${position}/${number}`;
  const cached = responses.get(key);
  if (cached) return cached;

  const response = await fetch(`/api/candidates/${key}`, { signal });
  if (response.status !== 200 && response.status !== 404) {
    throw new Error(`Busca de candidato falhou (HTTP ${response.status}).`);
  }
  const body = (await response.json()) as CandidateLookupResponse;
  responses.set(key, body);
  return body;
}
