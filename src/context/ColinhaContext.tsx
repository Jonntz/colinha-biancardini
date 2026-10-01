"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { EDITABLE_SLOTS, EDITABLE_SLOT_BY_ID, type EditableSlotId } from "@/config/slots";
import { fetchCandidate } from "@/lib/candidates/client";
import { readSavedNumbers, saveNumbers } from "@/lib/storage";
import { colinhaReducer, createInitialState, type ColinhaState } from "./colinha-reducer";

/** Espera após o último dígito antes de consultar a API. */
export const LOOKUP_DEBOUNCE_MS = 350;
const NON_DIGITS = /\D/g;

export interface ColinhaActions {
  /** Atualiza os dígitos de um cargo; com o número completo, agenda a busca do candidato. */
  setDigits: (slot: EditableSlotId, value: string) => void;
  /** Refaz a busca do número atual (após erro de rede). */
  retry: (slot: EditableSlotId) => void;
  /** Limpa todos os cargos editáveis. */
  reset: () => void;
}

export interface ColinhaMeta {
  /** Nó da colinha: área capturada na exportação da imagem. */
  captureRef: RefObject<HTMLDivElement | null>;
}

export interface ColinhaContextValue {
  state: ColinhaState;
  actions: ColinhaActions;
  meta: ColinhaMeta;
}

export const ColinhaContext = createContext<ColinhaContextValue | null>(null);

export function useColinha(): ColinhaContextValue {
  const context = use(ColinhaContext);
  if (!context) throw new Error("useColinha precisa estar dentro de <ColinhaProvider>.");
  return context;
}

/**
 * Único lugar que sabe como o estado da colinha é gerenciado (Context + useReducer).
 * Os componentes consomem apenas a interface { state, actions, meta }.
 */
export function ColinhaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(colinhaReducer, undefined, createInitialState);
  const captureRef = useRef<HTMLDivElement>(null);
  // Valores transitórios fora do render: últimos dígitos, timers de debounce e buscas em andamento.
  const digitsRef = useRef(new Map<EditableSlotId, string>());
  const timersRef = useRef(new Map<EditableSlotId, number>());
  const requestsRef = useRef(new Map<EditableSlotId, AbortController>());

  const cancelLookup = useCallback((slot: EditableSlotId) => {
    window.clearTimeout(timersRef.current.get(slot));
    timersRef.current.delete(slot);
    requestsRef.current.get(slot)?.abort();
    requestsRef.current.delete(slot);
  }, []);

  const runLookup = useCallback(async (slot: EditableSlotId, digits: string) => {
    const controller = new AbortController();
    requestsRef.current.set(slot, controller);
    try {
      const response = await fetchCandidate(EDITABLE_SLOT_BY_ID[slot].position, digits, controller.signal);
      dispatch({
        type: "lookup-settled",
        slot,
        digits,
        lookup: response.found ? { status: "found", candidate: response.candidate } : { status: "not-found" },
      });
    } catch {
      if (!controller.signal.aborted) dispatch({ type: "lookup-settled", slot, digits, lookup: { status: "error" } });
    } finally {
      if (requestsRef.current.get(slot) === controller) requestsRef.current.delete(slot);
    }
  }, []);

  const applyDigits = useCallback(
    (slot: EditableSlotId, digits: string, delay: number) => {
      cancelLookup(slot);
      digitsRef.current.set(slot, digits);
      const complete = digits.length === EDITABLE_SLOT_BY_ID[slot].digits;
      dispatch({ type: "digits-changed", slot, digits, complete });
      if (!complete) return;

      const timer = window.setTimeout(() => {
        timersRef.current.delete(slot);
        void runLookup(slot, digits);
      }, delay);
      timersRef.current.set(slot, timer);
    },
    [cancelLookup, runLookup],
  );

  const persist = useCallback(() => {
    saveNumbers(Object.fromEntries([...digitsRef.current].filter(([, digits]) => digits !== "")));
  }, []);

  const setDigits = useCallback(
    (slot: EditableSlotId, value: string) => {
      const digits = value.replace(NON_DIGITS, "").slice(0, EDITABLE_SLOT_BY_ID[slot].digits);
      if (digits === (digitsRef.current.get(slot) ?? "")) return;
      applyDigits(slot, digits, LOOKUP_DEBOUNCE_MS);
      persist();
    },
    [applyDigits, persist],
  );

  const retry = useCallback(
    (slot: EditableSlotId) => applyDigits(slot, digitsRef.current.get(slot) ?? "", 0),
    [applyDigits],
  );

  const reset = useCallback(() => {
    for (const slot of EDITABLE_SLOTS) cancelLookup(slot.id);
    digitsRef.current.clear();
    dispatch({ type: "reset" });
    persist();
  }, [cancelLookup, persist]);

  // Restaura os números salvos neste aparelho. localStorage só existe no cliente, após a hidratação.
  useEffect(() => {
    const saved = readSavedNumbers();
    for (const slot of EDITABLE_SLOTS) {
      const digits = saved[slot.id];
      if (digits) applyDigits(slot.id, digits, 0);
    }
    return () => {
      for (const slot of EDITABLE_SLOTS) cancelLookup(slot.id);
    };
  }, [applyDigits, cancelLookup]);

  const actions = useMemo<ColinhaActions>(() => ({ setDigits, retry, reset }), [setDigits, retry, reset]);
  const meta = useMemo<ColinhaMeta>(() => ({ captureRef }), []);
  const value = useMemo<ColinhaContextValue>(() => ({ state, actions, meta }), [state, actions, meta]);

  return <ColinhaContext value={value}>{children}</ColinhaContext>;
}
