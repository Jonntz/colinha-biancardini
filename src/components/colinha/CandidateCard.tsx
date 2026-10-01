import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Candidate } from "@/types/candidate";
import { CandidatePhoto } from "./CandidatePhoto";
import { PartyBadge } from "./PartyBadge";

export type CardTone = "filled" | "empty";
export type HintTone = "muted" | "danger";

const CARD_TONE: Record<CardTone, string> = {
  filled: "min-h-240 bg-brand-yellow py-28 pl-28",
  empty: "min-h-136 bg-white py-26 pl-36",
};

const HINT_TONE: Record<HintTone, string> = {
  muted: "text-slate-500",
  danger: "text-red-600",
};

/** Nomes longos ganham fonte menor para caber ao lado das caixas de número. */
const LONG_NAME_LENGTH = 20;

/** Cartão de um cargo: amarelo quando há candidato, branco enquanto o número não foi preenchido. */
function Root({ tone, children }: { tone: CardTone; children: ReactNode }) {
  return (
    <article
      data-tone={tone}
      className={cn("relative flex items-center gap-24 rounded-c-card pr-32 transition-colors duration-300", CARD_TONE[tone])}
    >
      {children}
    </article>
  );
}

interface SummaryProps {
  label: string;
  candidate: Candidate;
  /** Avisos extras abaixo do partido (não entram na imagem). */
  children?: ReactNode;
}

/** Foto, cargo, nome e partido do candidato escolhido. */
function Summary({ label, candidate, children }: SummaryProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-28">
      <CandidatePhoto src={candidate.photoUrl} name={candidate.name} />
      <div className="min-w-0 flex-1">
        <p className="text-c-label leading-none font-extrabold tracking-[0.115em] text-navy/75 uppercase">{label}</p>
        <p
          className={cn(
            "mt-14 leading-none font-black tracking-[-0.005em] break-words text-navy",
            candidate.name.length > LONG_NAME_LENGTH ? "text-c-name-sm" : "text-c-name",
          )}
        >
          {candidate.name}
        </p>
        <div className="mt-10 flex">
          <PartyBadge party={candidate.party} />
        </div>
        {children}
      </div>
    </div>
  );
}

interface PromptProps {
  label: string;
  /** Id do input: tocar no título também abre o teclado. */
  htmlFor: string;
  hint: string;
  hintTone?: HintTone;
  children?: ReactNode;
}

/** Título do cargo e instrução/feedback enquanto o número não leva a um candidato. */
function Prompt({ label, htmlFor, hint, hintTone = "muted", children }: PromptProps) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={htmlFor} className="block text-c-row leading-none font-black tracking-[0.039em] text-navy uppercase">
        {label}
      </label>
      <p className={cn("mt-12.5 text-c-hint leading-none font-semibold", HINT_TONE[hintTone])}>{hint}</p>
      {children}
    </div>
  );
}

export const CandidateCard = { Root, Summary, Prompt };
