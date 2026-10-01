import { EDITABLE_SLOTS, type SlotId } from "@/config/slots";

export function slotInputId(slot: SlotId): string {
  return `numero-${slot}`;
}

/**
 * Leva o foco ao próximo cargo editável ainda incompleto, como a urna faz ao confirmar um voto.
 * Sem cargos pendentes, fecha o teclado para o eleitor ver a colinha inteira.
 */
export function focusNextIncompleteSlot(current: SlotId): void {
  const start = EDITABLE_SLOTS.findIndex((slot) => slot.id === current);
  const next = EDITABLE_SLOTS.slice(start + 1)
    .map((slot) => document.getElementById(slotInputId(slot.id)))
    .find((element): element is HTMLInputElement => element instanceof HTMLInputElement && element.value.length < element.maxLength);

  if (next) {
    next.focus();
    return;
  }
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}
