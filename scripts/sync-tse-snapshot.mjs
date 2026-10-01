#!/usr/bin/env node
/**
 * Baixa as listas de candidatos do DivulgaCandContas (TSE) e grava:
 *  - src/data/tse-snapshot.json → base offline usada pela API quando o TSE estiver fora do ar
 *  - src/data/parties.json      → mapa número → sigla do partido (usado no front enquanto o eleitor digita)
 *
 * Uso: npm run sync:tse
 * Configuração (ano, id da eleição, UF): src/config/tse.json
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const config = JSON.parse(await readFile(new URL("src/config/tse.json", root), "utf8"));

// Mesmos códigos usados em src/lib/candidates/positions.ts
const POSITIONS = [
  { position: "presidente", code: 1, scope: "BR" },
  { position: "governador", code: 3, scope: config.uf },
  { position: "senador", code: 5, scope: config.uf },
  { position: "deputado-federal", code: 6, scope: config.uf },
  { position: "deputado-estadual", code: 7, scope: config.uf },
];

// O Akamai do TSE recusa clientes sem cabeçalhos de navegador.
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
};

async function fetchList({ code, scope }) {
  const url = `${config.baseUrl}/v1/candidatura/listar/${config.year}/${scope}/${config.electionId}/${code}/candidatos`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`TSE respondeu ${res.status} para ${url}`);
  const body = await res.json();
  return body.candidatos ?? [];
}

const positions = {};
const parties = {};

for (const entry of POSITIONS) {
  const list = await fetchList(entry);
  positions[entry.position] = list
    .map((c) => ({
      number: c.numero,
      id: String(c.id),
      name: c.nomeUrna,
      party: c.partido?.sigla ?? "",
      fit: c.candidatoApto !== false,
      status: c.descricaoSituacao ?? "",
    }))
    .sort((a, b) => a.number - b.number);

  for (const c of positions[entry.position]) {
    const prefix = String(c.number).slice(0, 2);
    if (c.party && !parties[prefix]) parties[prefix] = c.party;
  }
  console.log(`✓ ${entry.position.padEnd(18)} ${String(list.length).padStart(4)} candidatos`);
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  electionId: config.electionId,
  uf: config.uf,
  positions,
};

const sortedParties = Object.fromEntries(Object.entries(parties).sort(([a], [b]) => Number(a) - Number(b)));

await writeFile(new URL("src/data/tse-snapshot.json", root), JSON.stringify(snapshot) + "\n");
await writeFile(new URL("src/data/parties.json", root), JSON.stringify(sortedParties, null, 2) + "\n");

console.log(`\nSnapshot salvo em ${fileURLToPath(new URL("src/data/tse-snapshot.json", root))}`);
console.log(`${Object.keys(sortedParties).length} partidos mapeados em src/data/parties.json`);
