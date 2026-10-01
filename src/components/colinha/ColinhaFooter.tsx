import { LEGAL_NOTICES } from "@/config/election";

export function ColinhaFooter() {
  return (
    <footer className="mt-60 pb-120">
      <p className="text-c-footer leading-none font-bold tracking-[0.076em] text-white uppercase">
        Confira sempre o número do candidato na urna.
      </p>
      <div className="mt-16 text-c-legal leading-22 font-medium tracking-[0.038em] text-white/60 uppercase">
        {LEGAL_NOTICES.map((notice) => (
          <p key={notice}>{notice}</p>
        ))}
      </div>
    </footer>
  );
}
