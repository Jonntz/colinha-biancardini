import { ELECTION } from "@/config/election";

const STEPS = [
  "Digite o número dos seus candidatos nos campos em branco.",
  "Nome, foto e partido aparecem sozinhos, direto do TSE.",
  "Toque em “Baixar Colinha” para salvar a imagem no aparelho.",
];

/** Instruções: abaixo da colinha no celular, coluna lateral no desktop. */
export function IntroPanel() {
  return (
    <section
      aria-labelledby="como-usar"
      className="px-6 pt-8 pb-6 text-white sm:mx-auto sm:max-w-[480px] sm:px-0 lg:col-start-1 lg:row-start-1 lg:mx-0 lg:max-w-md lg:self-end lg:p-0"
    >
      <p className="text-xs font-bold tracking-[0.2em] text-brand-yellow uppercase">
        Eleições {ELECTION.year} · {ELECTION.ufName}
      </p>
      <h2 id="como-usar" className="mt-3 text-2xl leading-tight font-black text-balance lg:text-4xl">
        Monte sua colinha e não esqueça nenhum número.
      </h2>
      <ol className="mt-5 space-y-3 text-sm text-white/80 lg:text-base">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xs font-black text-navy">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
        O celular não pode entrar na cabine de votação: imprima ou copie sua colinha no papel antes de votar.
      </p>
    </section>
  );
}
