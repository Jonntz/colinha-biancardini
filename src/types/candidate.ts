/** Cargos consultados no TSE. O 1º e o 2º voto para senador usam o mesmo cargo. */
export type PositionId =
  | "deputado-federal"
  | "deputado-estadual"
  | "senador"
  | "governador"
  | "presidente";

/** Dados de um candidato prontos para exibição na colinha. */
export interface Candidate {
  /** Número na urna. String para exibir dígito a dígito. */
  number: string;
  /** Nome de urna formatado ("Matheus Biancardine"). */
  name: string;
  /** Sigla do partido ("NOVO"). */
  party: string;
  /**
   * Foto servida pela própria aplicação (asset em /public ou proxy /api/photos).
   * Precisa ser same-origin para o html-to-image conseguir embutir a foto na exportação.
   */
  photoUrl: string | null;
  /** Situação da candidatura no TSE ("Deferido", "Renúncia"...). */
  status?: string;
  /** `false` quando o TSE marca a candidatura como inapta. */
  fit?: boolean;
}

/** Origem do dado: API ao vivo do TSE ou snapshot local (fallback offline). */
export type CandidateSource = "tse" | "snapshot";

/** Corpo de resposta de GET /api/candidates/[position]/[number] (200 ou 404). */
export type CandidateLookupResponse =
  | { found: true; candidate: Candidate; source: CandidateSource }
  | { found: false; source: CandidateSource };
