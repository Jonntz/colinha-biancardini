import { POSITIONS } from "@/lib/candidates/positions";
import type { Candidate, PositionId } from "@/types/candidate";

export type FixedSlotId = "deputado-federal" | "governador";
export type EditableSlotId = "deputado-estadual" | "senador-1" | "senador-2" | "presidente";
export type SlotId = FixedSlotId | EditableSlotId;

interface SlotBase {
  /** Rótulo exibido na colinha. */
  label: string;
  position: PositionId;
  /** Dígitos do número na urna (derivado do cargo). */
  digits: number;
}

/** Cargo com candidato definido pela campanha: já vem preenchido e não pode ser editado. */
export interface FixedSlot extends SlotBase {
  kind: "fixed";
  id: FixedSlotId;
  candidate: Candidate;
}

/** Cargo em que o eleitor digita o número e o candidato é buscado no TSE. */
export interface EditableSlot extends SlotBase {
  kind: "editable";
  id: EditableSlotId;
}

export type Slot = FixedSlot | EditableSlot;

function fixedSlot(id: FixedSlotId, label: string, position: PositionId, candidate: Candidate): FixedSlot {
  return { kind: "fixed", id, label, position, digits: POSITIONS[position].digits, candidate };
}

function editableSlot(id: EditableSlotId, label: string, position: PositionId): EditableSlot {
  return { kind: "editable", id, label, position, digits: POSITIONS[position].digits };
}

/** Cargos na ordem de votação da urna em 2026. */
export const SLOTS: readonly Slot[] = [
  fixedSlot("deputado-federal", "Deputado Federal", "deputado-federal", {
    number: "3055",
    name: "Matheus Biancardine",
    party: "NOVO",
    photoUrl: "/candidatos/matheus-biancardine.png",
  }),
  editableSlot("deputado-estadual", "Deputado Estadual", "deputado-estadual"),
  editableSlot("senador-1", "Senador • 1º voto", "senador"),
  editableSlot("senador-2", "Senador • 2º voto", "senador"),
  fixedSlot("governador", "Governador", "governador", {
    number: "55",
    name: "Mateus Simões",
    party: "PSD",
    photoUrl: "/candidatos/mateus-simoes.png",
  }),
  editableSlot("presidente", "Presidente", "presidente"),
];

export const EDITABLE_SLOTS: readonly EditableSlot[] = SLOTS.filter(
  (slot): slot is EditableSlot => slot.kind === "editable",
);

export const EDITABLE_SLOT_BY_ID = Object.fromEntries(
  EDITABLE_SLOTS.map((slot) => [slot.id, slot]),
) as Readonly<Record<EditableSlotId, EditableSlot>>;

/** A urna não aceita o mesmo candidato nos dois votos para o Senado. */
export const MUST_DIFFER_FROM: Readonly<Partial<Record<EditableSlotId, EditableSlotId>>> = {
  "senador-2": "senador-1",
};
