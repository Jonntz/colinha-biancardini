@AGENTS.md

# Minha Colinha · Eleições 2026

Aplicação web (Next.js App Router) para o eleitor de **Minas Gerais** montar a colinha da eleição de
**4 de outubro de 2026**, conferir nome/foto/partido direto do TSE e baixar a colinha como imagem PNG
(1080 px, formato stories).

> **Regra do projeto:** toda mudança deve ser registrada no [Changelog](#changelog) no fim deste arquivo
> (data, o que mudou e por quê), conforme o projeto evolui.

## Comandos

| Comando             | O que faz                                                                  |
| ------------------- | -------------------------------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento (Turbopack) em http://localhost:3000           |
| `npm run build`     | Build de produção (`next build`)                                           |
| `npm start`         | Sobe o build de produção                                                   |
| `npm run lint`      | ESLint (flat config do Next 16 + regras do React Compiler)                 |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` (gera `RouteContext`/`LayoutProps`)        |
| `npm run sync:tse`  | Atualiza o snapshot offline (`src/data/tse-snapshot.json` e `parties.json`) |

## Stack

- Next.js **16.3** (App Router, Turbopack), React **19.2**, TypeScript estrito, Tailwind CSS **v4**
  (config CSS-first em `src/app/globals.css`, não existe `tailwind.config`).
- `html-to-image` para exportar a colinha (carregado sob demanda com `import()`).
- `server-only` para garantir que o cliente TSE e o snapshot nunca vão para o bundle do navegador.
- Next 16 tem mudanças de API: leia `node_modules/next/dist/docs/` antes de usar APIs novas (ver AGENTS.md).
  Ex.: `params` é `Promise`, `RouteContext<'/rota/[x]'>` é global, `preferredRegion` está deprecado.

## Arquitetura

```
src/
  app/
    page.tsx                         página (Server Component) — compõe provider, colinha e ações
    layout.tsx                       fontes (Montserrat + Rubik Bold Italic), metadata, viewport
    globals.css                      tokens do design (cores, tipografia em "u", raios)
    api/candidates/[position]/[number]/route.ts   proxy TSE → { found, candidate, source }
    api/photos/[uf]/[id]/route.ts                 proxy da foto do TSE (same-origin p/ exportar)
  components/
    colinha/   ColinhaWrapper (área capturada), ColinhaHeader, ColinhaFooter, CandidateList,
               CandidateRow (FixedCandidateRow | EditableCandidateRow), CandidateCard (Root/Summary/Prompt),
               NumberInput (input invisível sobre DigitBox), CandidatePhoto, PartyBadge
    actions/   ColinhaActions (Baixar/Limpar + status), ExportPreviewDialog (plano B), icons
    layout/    IntroPanel (instruções; abaixo da colinha no celular, coluna esquerda no desktop)
  context/     ColinhaContext.tsx (Provider + useColinha), colinha-reducer.ts
  hooks/       useColinhaExport.ts (gera PNG e entrega: share/download/prévia)
  lib/
    candidates/  tse.ts (server-only, cache 30 min), snapshot.ts (server-only), repository.ts
                 (TSE → fallback snapshot), client.ts (fetch no navegador + cache da sessão),
                 positions.ts, record.ts, format.ts, parties.ts
    export/      capture.ts (html-to-image), save.ts (share/download), ignore.ts (data-export-ignore)
    storage.ts   números salvos no localStorage (chave versionada `minha-colinha:numeros:v1`)
    slot-focus.ts  ids dos inputs e foco automático no próximo cargo
  config/      election.ts (ano, data, UF, avisos legais), slots.ts (cargos na ordem da urna), tse.json
  data/        tse-snapshot.json (gerado), parties.json (gerado)
  types/       candidate.ts
scripts/sync-tse-snapshot.mjs
public/candidatos/   fotos dos candidatos fixos (recortadas de colinha.png, cantos com alpha)
```

### Estado (Context API + useReducer)

- `ColinhaProvider` segue o padrão `{ state, actions, meta }` (skill vercel-composition-patterns):
  só o provider sabe como o estado funciona; os componentes consomem a interface.
- `state`: um `SlotEntry` por cargo editável → `{ digits, lookup }`, com
  `lookup.status` ∈ `idle | loading | found | not-found | error`.
- `actions.setDigits` sanitiza, atualiza, persiste no localStorage e, com o número completo, agenda a
  busca com **debounce de 350 ms** (`LOOKUP_DEBOUNCE_MS`) + `AbortController` por cargo. O reducer
  descarta respostas de números que já mudaram.
- `meta.captureRef`: ref do nó capturado na exportação.

## Regras de negócio

- Ordem da urna 2026: Deputado Federal → Deputado Estadual → Senador (1º voto) → Senador (2º voto) →
  Governador → Presidente (`src/config/slots.ts`).
- **Cargos fixos (hardcoded, campo desabilitado):**
  - Deputado Federal: **Matheus Biancardine · 3055 · NOVO**
  - Governador: **Mateus Simões · 55 · PSD**
- Dígitos por cargo: Dep. Estadual 5, Dep. Federal 4, Senador 3, Governador 2, Presidente 2.
- Os 2 primeiros dígitos indicam o partido (`partyFromNumber`) → hint "Partido X" enquanto digita.
- Os dois votos para senador não podem repetir o candidato (`MUST_DIFFER_FROM`).
- Número duplicado no TSE (substituições/indeferidos): `pickCandidate` prefere apto + "Deferido".
- Candidatura inapta (`fit: false`) aparece com aviso na tela.
- O rodapé com CNPJ/identificação da propaganda (`LEGAL_NOTICES`) é obrigatório e entra na imagem.

## API do TSE (DivulgaCandContas)

- Base: `https://divulgacandcontas.tse.jus.br/divulga/rest` (pode ser sobrescrita por `TSE_BASE_URL`).
- Eleição Geral Federal 2026: id **`20322002026`** (`src/config/tse.json`).
- Lista: `/v1/candidatura/listar/{ano}/{UE}/{eleicao}/{cargo}/candidatos` — UE `BR` p/ presidente, `MG` nos demais.
  Códigos: 1 Presidente, 3 Governador, 5 Senador, 6 Dep. Federal, 7 Dep. Estadual.
- Foto: `/arquivo/img/{eleicao}/{idCandidato}/{UE}` (JPEG/PNG ~161×225).
- O Akamai do TSE **bloqueia curl** (403); o `fetch` do Node com User-Agent de navegador funciona.
  Por isso o navegador nunca chama o TSE direto: tudo passa pelos Route Handlers.
- Listas grandes (Dep. Estadual ~2,4 MB) → `cache: "no-store"` + cache em memória de 30 min
  (o data cache do Next limita itens a 2 MB).
- Fallback ("mock robusto"): `src/data/tse-snapshot.json` com dados **reais** do TSE (gerado em
  2026-10-01, 1.796 candidaturas MG/BR). Usado quando o TSE falha (cooldown de 60 s) ou com
  `CANDIDATE_SOURCE=snapshot`. A resposta informa `source: "tse" | "snapshot"`.
- Rode `npm run sync:tse` para atualizar o snapshot antes de um deploy.

## Design (fiel a `colinha.png`)

- Referência: `colinha.png` (1080 × 1920). Toda a colinha é medida em **u = 1/1080 da largura**:
  - `.colinha` define `--u` (registrado via `@property` como `<length>`) e **sobrescreve `--spacing`**
    com `--u`, então `p-28`, `w-150`, `gap-18`, `min-h-1920`… valem exatamente os px do layout original.
  - Tipografia/raios em `@theme inline` (`text-c-title`, `rounded-c-card`…) para resolver `var(--u)` no elemento.
  - Largura: `min(100cqi, 480px)` (container `.colinha-stage`); fallback `100vw`.
- Cores: navy `#052E3F`, amarelo `#FDC730`, verde `#1CA638`, borda das caixas `#C9D3DE`,
  hint `slate-500` (#62748E), rótulo do cartão amarelo `navy/75`, avisos legais `white/60`.
- Fontes (identificadas por sobreposição de pixels): título **Rubik Bold Italic** 108u (tracking −0,027em);
  demais textos **Montserrat** — nomes 900 40u, títulos de cargo 900 28,5u, rótulos 800 20,5u,
  dígitos 900 54u, hints 600 22,5u, rodapé 700 23,5u, avisos legais 500 15,5u.
- Medidas-chave (u): margens laterais 72; cartões 936 de largura, gap 18, raio 30; cartão amarelo 240
  de altura (foto 150×184, raio 20); cartão branco 136; caixas cheias 72×100 (raio 16, gap 10);
  caixas vazias 60×84 (borda 2,5).
- Validação visual: diferença ≤ ±4 px (canvas 1080) em todos os elementos medidos.

## Exportação da imagem

- `captureColinha` (lib/export/capture.ts): espera fontes e `img.decode()`, tira o foco, usa
  `pixelRatio = 1080 / largura` → PNG sempre com 1080 px de largura (1080×1920 no estado inicial).
- Tudo com `data-export-ignore` (inputs invisíveis, avisos, botões) fica fora da imagem.
- Fontes embutidas uma vez (`getFontEmbedCSS`) e reaproveitadas; no WebKit faz uma captura de
  aquecimento (bug do Safari que omite imagens na 1ª captura).
- Fotos precisam ser same-origin (`/candidatos/*` ou `/api/photos/*`), senão somem do PNG (CORS).
- Entrega (`saveImage`): iOS → folha de compartilhamento ("Salvar imagem" vai para Fotos);
  Android/desktop → download direto; navegadores de apps (Instagram/Facebook) → prévia para salvar
  com toque longo. Se o share do iOS expirar, também cai na prévia.

## Rodar localmente

- `npm run dev` → http://localhost:3000. O terminal também mostra a URL "Network" (ex.:
  `http://192.168.0.4:3000`) para abrir no **celular conectado ao mesmo Wi-Fi**.
- O Next 16 bloqueia origens diferentes de localhost nos assets de dev; o `next.config.ts` libera
  automaticamente os IPv4 da máquina na rede local (`allowedDevOrigins`).
- Limitação do teste via rede local (HTTP): `navigator.share` exige HTTPS, então no iPhone o botão
  baixa o arquivo pelo Safari (vai para o app Arquivos) em vez de abrir "Salvar imagem" → Fotos.
  Para testar esse fluxo, use uma URL HTTPS (preview de deploy ou túnel).

## Como verificar

1. `npm run lint && npm run typecheck && npm run build`
2. `npm start` e testar a API:
   `curl localhost:3000/api/candidates/presidente/30` → Zema/NOVO (`source: "tse"`).
3. Offline: `CANDIDATE_SOURCE=snapshot npm start` (ou `TSE_BASE_URL=http://127.0.0.1:9`) → `source: "snapshot"`.
4. No navegador: digitar 30000 / 300 / 555 / 30 → 6 cartões amarelos → "Baixar Colinha" gera PNG 1080 px.

## Deploy

- Qualquer host Node com Next 16 (Vercel, Netlify…). Não há variáveis obrigatórias.
- Se o servidor ficar fora do Brasil e o TSE recusar a região, a API cai no snapshot automaticamente
  (fotos dos candidatos digitados viram iniciais). Opções: hospedar as funções em São Paulo
  (ex.: região `gru1` na Vercel) ou apontar `TSE_BASE_URL` para um proxy no Brasil.

## Changelog

### 2026-10-01 — teste local pelo celular

- `next.config.ts`: `allowedDevOrigins` com os IPs da máquina na rede local, para abrir o
  `npm run dev` no celular (o Next 16 bloqueia essas origens por padrão). Verificado: página abre e
  busca candidatos via `http://<IP-local>:3000`.
- CLAUDE.md: seção "Rodar localmente" (inclui a limitação do compartilhamento no iOS sem HTTPS).

### 2026-10-01 — versão inicial

- Setup: Next.js 16.3.8 + React 19.2 + TypeScript estrito + Tailwind v4 (create-next-app),
  dependências `html-to-image` e `server-only`; scripts `typecheck` e `sync:tse`.
- Design: cores, fontes, tamanhos e espaçamentos medidos em `colinha.png` (análise de pixels);
  sistema de unidades "u" com `--spacing` sobrescrito; fotos dos candidatos fixos recortadas do layout.
- Componentes: ColinhaWrapper, ColinhaHeader, ColinhaFooter, CandidateList, CandidateRow
  (variantes fixa/editável), CandidateCard (Root/Summary/Prompt), NumberInput, DigitBox,
  CandidatePhoto, PartyBadge, ColinhaActions, ExportPreviewDialog, IntroPanel.
- Estado global com Context API + useReducer (debounce 350 ms, AbortController, cache de sessão,
  persistência no localStorage, foco automático no próximo cargo).
- Route Handlers: `/api/candidates/[position]/[number]` (TSE ao vivo + fallback snapshot, cache em
  memória e headers de CDN) e `/api/photos/[uf]/[id]` (proxy de foto same-origin).
- Snapshot real do TSE (`npm run sync:tse`) como mock offline; `CANDIDATE_SOURCE` e `TSE_BASE_URL`.
- Exportação PNG 1080 px com html-to-image + entrega por plataforma (share iOS, download, prévia).
- Verificado: lint, typecheck e build ok; API testada (TSE ao vivo, snapshot, TSE fora do ar);
  fluxo E2E no Chrome headless (digitação, busca, foco, persistência, duplicidade no Senado, número
  inexistente, download do PNG 1080×2262 com tudo preenchido).
