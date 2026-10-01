"use client";

import type { ReactNode } from "react";
import { MUST_DIFFER_FROM, type EditableSlot, type FixedSlot, type Slot } from "@/config/slots";
import { useColinha } from "@/context/ColinhaContext";
import type { SlotEntry } from "@/context/colinha-reducer";
import { partyFromNumber } from "@/lib/candidates/parties";
import { exportIgnoreProps } from "@/lib/export/ignore";
import { focusNextIncompleteSlot, slotInputId } from "@/lib/slot-focus";
import { CandidateCard, type HintTone } from "./CandidateCard";
import { NumberInput } from "./NumberInput";

/** Uma linha da colinha: variante fixa (definida pela campanha) ou editável (o eleitor digita). */
export function CandidateRow({ slot }: { slot: Slot }) {
  return slot.kind === "fixed" ? <FixedCandidateRow slot={slot} /> : <EditableCandidateRow slot={slot} />;
}

/** Cargo pré-definido: já vem preenchido e com o campo desabilitado. */
export function FixedCandidateRow({ slot }: { slot: FixedSlot }) {
  const { candidate } = slot;
  return (
    <CandidateCard.Root tone="filled">
      <CandidateCard.Summary label={slot.label} candidate={candidate} />
      <NumberInput
        id={slotInputId(slot.id)}
        label={`${slot.label}: ${candidate.name} (${candidate.party}), número ${candidate.number}. Campo fixo.`}
        value={candidate.number}
        length={slot.digits}
        tone="solid"
        disabled
      />
    </CandidateCard.Root>
  );
}

interface RowFeedback {
  hint: string;
  tone: HintTone;
  /** Texto lido por leitores de tela quando o estado muda. */
  announcement: string;
}

function describeEntry(slot: EditableSlot, entry: SlotEntry, duplicate: boolean): RowFeedback {
  if (duplicate && entry.lookup.status !== "found") {
    return { hint: "Igual ao 1º voto", tone: "danger", announcement: "Este número já está no 1º voto." };
  }

  switch (entry.lookup.status) {
    case "loading":
      return { hint: "Buscando candidato…", tone: "muted", announcement: "Buscando candidato." };
    case "not-found":
      return {
        hint: "Número não encontrado",
        tone: "danger",
        announcement: `Nenhum candidato a ${slot.label} com o número ${entry.digits}.`,
      };
    case "error":
      return { hint: "Sem conexão com o TSE", tone: "danger", announcement: "Não foi possível buscar o candidato." };
    case "found": {
      const { name, party } = entry.lookup.candidate;
      return { hint: "", tone: "muted", announcement: duplicate ? `${name} já está no 1º voto.` : `${name}, ${party}.` };
    }
    case "idle": {
      if (entry.digits.length < 2) return { hint: "Digite o número", tone: "muted", announcement: "" };
      const party = partyFromNumber(entry.digits);
      return party
        ? { hint: `Partido ${party}`, tone: "muted", announcement: `Partido ${party}.` }
        : { hint: "Nenhum partido com esse número", tone: "danger", announcement: "Nenhum partido com esse número." };
    }
  }
}

/** Aviso exibido só na tela (fica fora da imagem baixada). */
function RowWarning({ children }: { children: ReactNode }) {
  return (
    <p {...exportIgnoreProps} className="mt-10 text-c-hint leading-tight font-bold text-red-700">
      {children}
    </p>
  );
}

/** Cargo livre: o eleitor digita o número e o candidato é buscado no TSE (com debounce). */
export function EditableCandidateRow({ slot }: { slot: EditableSlot }) {
  const { state, actions } = useColinha();
  const entry = state[slot.id];
  const rival = MUST_DIFFER_FROM[slot.id];
  const duplicate = rival !== undefined && entry.digits.length === slot.digits && entry.digits === state[rival].digits;
  const candidate = entry.lookup.status === "found" ? entry.lookup.candidate : null;
  const feedback = describeEntry(slot, entry, duplicate);
  const inputId = slotInputId(slot.id);
  const statusId = `${inputId}-status`;

  return (
    <CandidateCard.Root tone={candidate ? "filled" : "empty"}>
      {candidate ? (
        <CandidateCard.Summary label={slot.label} candidate={candidate}>
          {candidate.fit === false ? <RowWarning>Candidatura “{candidate.status}” no TSE</RowWarning> : null}
          {duplicate ? <RowWarning>Repetido: escolha outro candidato</RowWarning> : null}
        </CandidateCard.Summary>
      ) : (
        <CandidateCard.Prompt label={slot.label} htmlFor={inputId} hint={feedback.hint} hintTone={feedback.tone}>
          {entry.lookup.status === "error" ? (
            <button
              {...exportIgnoreProps}
              type="button"
              onClick={() => actions.retry(slot.id)}
              className="mt-10 text-c-hint font-bold text-navy underline underline-offset-2"
            >
              Tentar de novo
            </button>
          ) : null}
        </CandidateCard.Prompt>
      )}
      <NumberInput
        id={inputId}
        label={`${slot.label}: digite o número do candidato (${slot.digits} dígitos)`}
        value={entry.digits}
        length={slot.digits}
        tone={candidate ? "solid" : "outline"}
        describedBy={statusId}
        onValueChange={(value) => actions.setDigits(slot.id, value)}
        onComplete={() => focusNextIncompleteSlot(slot.id)}
        onEnter={() => focusNextIncompleteSlot(slot.id)}
      />
      <p {...exportIgnoreProps} id={statusId} aria-live="polite" className="sr-only">
        {feedback.announcement}
      </p>
    </CandidateCard.Root>
  );
}
