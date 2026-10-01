import tse from "./tse.json";

/**
 * Dados da eleição. Os identificadores do TSE ficam em tse.json para serem
 * compartilhados com scripts/sync-tse-snapshot.mjs.
 */
export const ELECTION = {
  year: tse.year,
  dateLabel: "4 de outubro",
  uf: tse.uf,
  ufName: "Minas Gerais",
  tseElectionId: tse.electionId,
  tseBaseUrl: tse.baseUrl,
} as const;

/** Identificação obrigatória da propaganda eleitoral, reproduzida no rodapé da colinha. */
export const LEGAL_NOTICES = [
  "Eleição 2026 Matheus Biancardine Mota Deputado Federal | CNPJ 68.306.593/0001-52 | NOVO",
  "Eleição 2026 Mateus Simões 55 Governador | Vice Danilo de Castro | CNPJ 68.461.641/0001-87",
] as const;
