import type { PositionId } from "@/types/candidate";

interface PositionMeta {
  /** Código do cargo no DivulgaCandContas. */
  tseCode: number;
  /** Quantidade de dígitos digitados na urna. */
  digits: number;
  /** Abrangência: nacional (unidade eleitoral "BR") ou estadual (UF da eleição). */
  scope: "national" | "state";
}

export const POSITIONS: Readonly<Record<PositionId, PositionMeta>> = {
  presidente: { tseCode: 1, digits: 2, scope: "national" },
  governador: { tseCode: 3, digits: 2, scope: "state" },
  senador: { tseCode: 5, digits: 3, scope: "state" },
  "deputado-federal": { tseCode: 6, digits: 4, scope: "state" },
  "deputado-estadual": { tseCode: 7, digits: 5, scope: "state" },
};

export function isPositionId(value: string): value is PositionId {
  return Object.prototype.hasOwnProperty.call(POSITIONS, value);
}
