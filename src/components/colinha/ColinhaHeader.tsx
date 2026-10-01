import { ELECTION } from "@/config/election";

export function ColinhaHeader() {
  return (
    <header className="pt-205">
      <p className="text-c-kicker leading-none font-bold tracking-[0.135em] text-white uppercase">
        Eleições {ELECTION.year} · {ELECTION.dateLabel}
      </p>
      <h1 className="mt-12 font-display text-c-title leading-none font-bold tracking-[-0.027em] text-brand-yellow uppercase italic">
        Minha colinha
      </h1>
      <div aria-hidden className="mt-13.5 h-8 w-160 bg-brand-green" />
    </header>
  );
}
