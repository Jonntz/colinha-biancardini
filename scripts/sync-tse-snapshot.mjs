#!/usr/bin/env node
/**
 * Baixa as listas de candidatos do DivulgaCandContas (TSE) e grava:
 *  - src/data/tse-snapshot.json → base offline usada pela API quando o TSE estiver fora do ar
 *  - src/data/parties.json      → mapa número → sigla do partido (usado no front enquanto o eleitor digita)
 *  - public/candidatos/tse/     → fotos dos cargos editáveis, servidas como arquivos estáticos
 *
 * As fotos ficam no projeto porque o TSE recusa IPs de datacenter (Vercel/AWS): em produção a
 * rota /api/photos não consegue buscá-las. Fotos já baixadas não são baixadas de novo.
 *
 * Uso: npm run sync:tse
 * Configuração (ano, id da eleição, UF): src/config/tse.json
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
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

// Cargos que o eleitor digita (Deputado Federal e Governador são fixos e já têm foto própria).
const PHOTO_POSITIONS = new Set(["presidente", "senador", "deputado-estadual"]);
const PHOTO_DIR = new URL("public/candidatos/tse/", root);
const PHOTO_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const PHOTO_CONCURRENCY = 8;

async function fetchList({ code, scope }) {
  const url = `${config.baseUrl}/v1/candidatura/listar/${config.year}/${scope}/${config.electionId}/${code}/candidatos`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`TSE respondeu ${res.status} para ${url}`);
  const body = await res.json();
  return body.candidatos ?? [];
}

/** Baixa a foto e devolve o caminho público ("/candidatos/tse/<id>.jpg"), ou null se o TSE não tiver. */
async function downloadPhoto(id, scope) {
  const url = `${config.baseUrl}/arquivo/img/${config.electionId}/${id}/${scope}`;
  try {
    const res = await fetch(url, { headers: { ...HEADERS, Accept: "image/*" }, signal: AbortSignal.timeout(30_000) });
    const extension = PHOTO_EXTENSIONS[res.headers.get("content-type")?.split(";")[0] ?? ""];
    if (!res.ok || !extension) return null;
    const fileName = `${id}.${extension}`;
    await writeFile(new URL(fileName, PHOTO_DIR), Buffer.from(await res.arrayBuffer()));
    return `/candidatos/tse/${fileName}`;
  } catch {
    return null;
  }
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

await mkdir(PHOTO_DIR, { recursive: true });
const existingPhotos = new Map((await readdir(PHOTO_DIR)).map((file) => [file.split(".")[0], `/candidatos/tse/${file}`]));

const positions = {};
const parties = {};

for (const entry of POSITIONS) {
  const list = await fetchList(entry);
  const candidates = list
    .map((c) => ({
      number: c.numero,
      id: String(c.id),
      name: c.nomeUrna,
      party: c.partido?.sigla ?? "",
      fit: c.candidatoApto !== false,
      status: c.descricaoSituacao ?? "",
    }))
    .sort((a, b) => a.number - b.number);

  let photoSummary = "";
  if (PHOTO_POSITIONS.has(entry.position)) {
    const photos = await mapWithConcurrency(candidates, PHOTO_CONCURRENCY, (c) =>
      existingPhotos.has(c.id) ? existingPhotos.get(c.id) : downloadPhoto(c.id, entry.scope),
    );
    candidates.forEach((c, index) => (c.photo = photos[index]));
    photoSummary = ` · ${photos.filter(Boolean).length} fotos`;
  }
  positions[entry.position] = candidates;

  for (const c of candidates) {
    const prefix = String(c.number).slice(0, 2);
    if (c.party && !parties[prefix]) parties[prefix] = c.party;
  }
  console.log(`✓ ${entry.position.padEnd(18)} ${String(list.length).padStart(4)} candidatos${photoSummary}`);
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
