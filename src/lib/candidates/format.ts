const PARTICLES = new Set(["da", "das", "de", "do", "dos", "e"]);
const HAS_VOWEL = /[aeiouyáàâãéêíóôõúü]/;
const ROMAN_NUMERAL = /^(?:i{1,3}|iv|vi{0,3}|ix|x)$/;
const WHITESPACE = /\s+/;

/**
 * Nome de urna do TSE para exibição: "MATHEUS BIANCARDINE" → "Matheus Biancardine".
 * Mantém partículas em minúsculas ("da", "de") e siglas/numerais em maiúsculas ("MLB", "II").
 */
export function formatCandidateName(urnName: string): string {
  return urnName
    .trim()
    .toLocaleLowerCase("pt-BR")
    .split(WHITESPACE)
    .map((word, index) => {
      if (index > 0 && PARTICLES.has(word)) return word;
      if (!HAS_VOWEL.test(word) || ROMAN_NUMERAL.test(word)) return word.toLocaleUpperCase("pt-BR");
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    })
    .join(" ");
}

/** Iniciais para o avatar de fallback: "Mateus Simões" → "MS". */
export function initialsOf(name: string): string {
  const words = name.trim().split(WHITESPACE);
  const first = words[0]?.charAt(0) ?? "";
  const last = words.length > 1 ? (words.at(-1)?.charAt(0) ?? "") : "";
  return (first + last).toLocaleUpperCase("pt-BR");
}
