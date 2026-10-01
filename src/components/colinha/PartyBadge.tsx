/** Selo verde com a sigla do partido. O padding direito desconta o tracking da última letra. */
export function PartyBadge({ party }: { party: string }) {
  return (
    <span className="inline-flex h-36 items-center rounded-c-badge bg-brand-green pr-13 pl-16 text-c-badge leading-none font-extrabold tracking-[0.08em] text-white uppercase">
      {party}
    </span>
  );
}
