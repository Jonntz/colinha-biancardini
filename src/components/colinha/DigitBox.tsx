import { cn } from "@/lib/cn";

/** "solid": caixa escura com dígito amarelo (cargo preenchido). "outline": caixa vazada (cargo em branco). */
export type DigitTone = "solid" | "outline";

const TONE_STYLES: Record<DigitTone, { box: string; active: string }> = {
  solid: {
    box: "h-100 w-72 bg-navy text-c-digit text-brand-yellow",
    active: "outline-solid outline-[length:calc(var(--u)*4)] outline-offset-[calc(var(--u)*4)] outline-navy",
  },
  outline: {
    box: "h-84 w-60 border-[length:calc(var(--u)*2.5)] border-digit-outline bg-white text-c-digit-sm text-navy",
    active: "border-navy",
  },
};

interface DigitBoxProps {
  tone: DigitTone;
  digit?: string;
  /** Próxima posição a ser digitada (campo em foco). */
  active: boolean;
}

export function DigitBox({ tone, digit, active }: DigitBoxProps) {
  const styles = TONE_STYLES[tone];
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-c-box leading-none font-black transition-colors duration-200",
        styles.box,
        active && styles.active,
      )}
    >
      {digit ? digit : active ? <span className="h-[45%] w-4 rounded-full bg-current motion-safe:animate-pulse" /> : null}
    </span>
  );
}
