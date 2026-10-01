import { EDITABLE_SLOTS, type EditableSlotId } from "@/config/slots";

const STORAGE_KEY = "minha-colinha:numeros:v1";
const ONLY_DIGITS = /^\d+$/;

export type SavedNumbers = Partial<Record<EditableSlotId, string>>;

/** Números digitados neste aparelho (a colinha continua lá ao reabrir a página). */
export function readSavedNumbers(): SavedNumbers {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};

    const saved: SavedNumbers = {};
    for (const slot of EDITABLE_SLOTS) {
      const value = (parsed as Record<string, unknown>)[slot.id];
      if (typeof value === "string" && ONLY_DIGITS.test(value) && value.length <= slot.digits) {
        saved[slot.id] = value;
      }
    }
    return saved;
  } catch {
    return {};
  }
}

export function saveNumbers(numbers: SavedNumbers): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(numbers));
  } catch {
    // Modo privado, cota cheia ou storage bloqueado: a colinha funciona sem persistir.
  }
}
