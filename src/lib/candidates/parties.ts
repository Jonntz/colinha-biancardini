import parties from "@/data/parties.json";

const PARTY_BY_PREFIX: Readonly<Record<string, string>> = parties;

/** Os dois primeiros dígitos de qualquer número na urna identificam o partido. */
export function partyFromNumber(digits: string): string | null {
  return digits.length >= 2 ? (PARTY_BY_PREFIX[digits.slice(0, 2)] ?? null) : null;
}
