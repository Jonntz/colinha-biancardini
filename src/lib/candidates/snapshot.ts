import "server-only";

import snapshot from "@/data/tse-snapshot.json";
import type { PositionId } from "@/types/candidate";
import { indexByNumber, type CandidateIndex, type CandidateRecord } from "./record";

interface SnapshotFile {
  generatedAt: string;
  electionId: string;
  uf: string;
  positions: Record<PositionId, CandidateRecord[]>;
}

/**
 * Cópia local das listas do TSE, gerada por `npm run sync:tse`.
 * É o "mock robusto" da aplicação: dados reais usados quando a API oficial está fora do ar.
 */
const SNAPSHOT: SnapshotFile = snapshot;

const indexes = new Map<PositionId, CandidateIndex>();
let localPhotos: Map<string, string> | null = null;

export function getSnapshotIndex(position: PositionId): CandidateIndex {
  let index = indexes.get(position);
  if (!index) {
    index = indexByNumber(SNAPSHOT.positions[position]);
    indexes.set(position, index);
  }
  return index;
}

/** Foto estática do candidato em /public (vale também para resultados vindos do TSE ao vivo). */
export function getLocalPhoto(candidateId: string): string | null {
  if (!localPhotos) {
    localPhotos = new Map();
    for (const records of Object.values(SNAPSHOT.positions)) {
      for (const record of records) if (record.photo) localPhotos.set(record.id, record.photo);
    }
  }
  return localPhotos.get(candidateId) ?? null;
}

export const SNAPSHOT_GENERATED_AT = SNAPSHOT.generatedAt;
