import { EDITABLE_SLOTS, type EditableSlotId } from "@/config/slots";
import type { Candidate } from "@/types/candidate";

export type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; candidate: Candidate }
  | { status: "not-found" }
  | { status: "error" };

export interface SlotEntry {
  digits: string;
  lookup: LookupState;
}

export type ColinhaState = Readonly<Record<EditableSlotId, SlotEntry>>;

export type ColinhaAction =
  | { type: "digits-changed"; slot: EditableSlotId; digits: string; complete: boolean }
  | { type: "lookup-settled"; slot: EditableSlotId; digits: string; lookup: LookupState }
  | { type: "reset" };

const IDLE: LookupState = { status: "idle" };
const LOADING: LookupState = { status: "loading" };

export function createInitialState(): ColinhaState {
  return Object.fromEntries(EDITABLE_SLOTS.map((slot) => [slot.id, { digits: "", lookup: IDLE }])) as Record<
    EditableSlotId,
    SlotEntry
  >;
}

export function colinhaReducer(state: ColinhaState, action: ColinhaAction): ColinhaState {
  switch (action.type) {
    case "digits-changed":
      // Número completo já entra em "loading": a busca dispara após o debounce.
      return { ...state, [action.slot]: { digits: action.digits, lookup: action.complete ? LOADING : IDLE } };

    case "lookup-settled":
      // Descarta respostas de um número que o eleitor já alterou.
      if (state[action.slot].digits !== action.digits) return state;
      return { ...state, [action.slot]: { digits: action.digits, lookup: action.lookup } };

    case "reset":
      return createInitialState();
  }
}
