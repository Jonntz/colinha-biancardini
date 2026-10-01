/** Candidatura normalizada — mesmo formato do snapshot em src/data/tse-snapshot.json. */
export interface CandidateRecord {
  number: number;
  /** Id da candidatura no DivulgaCandContas (usado na URL da foto). */
  id: string;
  /** Nome de urna como publicado pelo TSE (maiúsculas). */
  name: string;
  party: string;
  fit: boolean;
  status: string;
}

export type CandidateIndex = ReadonlyMap<number, readonly CandidateRecord[]>;

export function indexByNumber(records: Iterable<CandidateRecord>): CandidateIndex {
  const index = new Map<number, CandidateRecord[]>();
  for (const record of records) {
    const bucket = index.get(record.number);
    if (bucket) bucket.push(record);
    else index.set(record.number, [record]);
  }
  return index;
}

/**
 * O TSE pode listar mais de uma candidatura com o mesmo número (substituições, indeferimentos).
 * Prefere a candidatura apta e deferida; depois qualquer apta; por fim a primeira encontrada.
 */
export function pickCandidate(records: readonly CandidateRecord[] | undefined): CandidateRecord | null {
  if (!records?.length) return null;
  return (
    records.find((record) => record.fit && record.status === "Deferido") ??
    records.find((record) => record.fit) ??
    records[0]
  );
}
