# Minha Colinha · Eleições 2026

Monte a colinha para 4 de outubro: digite os números, confira **nome, foto e partido** direto do TSE
e baixe a colinha como imagem (PNG 1080 px, formato stories) no celular ou no computador.

- Deputado Federal (**Matheus Biancardine · 3055**) e Governador (**Mateus Simões · 55**) já vêm preenchidos.
- Deputado Estadual, Senador (2 votos) e Presidente são buscados no DivulgaCandContas (TSE), com
  fallback para um snapshot local caso a API oficial esteja fora do ar.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
```

Produção:

```bash
npm run build && npm start
```

## Scripts

| Script              | Descrição                                               |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Desenvolvimento                                         |
| `npm run build`     | Build de produção                                       |
| `npm start`         | Servidor de produção                                    |
| `npm run lint`      | ESLint                                                  |
| `npm run typecheck` | Tipos das rotas + TypeScript                            |
| `npm run sync:tse`  | Atualiza o snapshot offline com os dados atuais do TSE  |

## Variáveis de ambiente (opcionais)

Veja `.env.example`:

- `CANDIDATE_SOURCE=snapshot` → usa só os dados locais (modo offline/mock).
- `TSE_BASE_URL` → aponta a API do TSE para outro endereço (ex.: proxy no Brasil).

## API interna

- `GET /api/candidates/:cargo/:numero` → `{ found, candidate, source }`
  (`cargo`: `presidente`, `governador`, `senador`, `deputado-federal`, `deputado-estadual`)
- `GET /api/photos/:uf/:id` → foto do candidato servida pelo próprio domínio

Detalhes de arquitetura, design e decisões técnicas: [CLAUDE.md](./CLAUDE.md).
