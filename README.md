# PF_ondemo_Front

Front-end **Portal Fornecedor On Demand** — Angular 17, PrimeNG, multi-tenant por hostname.

## Stack

- Angular 17 (standalone)
- PrimeNG + PrimeIcons
- JWT via API Laravel (`PF_ondemo_Back`)

## Passo 6 — Wizard Contratação (MVP core)

- Listagem em `/contratacao`
- Wizard 4 passos: `/contratacao/nova` e `/contratacao/{uuid}/editar`
- Integração com `GET/POST/PATCH /api/v1/contratacao` e `POST .../submeter`
- Placeholder removido

### Testar wizard

1. Login com `admin@clientex.local` / `password` (ou `area@clientex.local` se existir no seed)
2. Menu **Contratação** → **Nova solicitação**
3. Preencher dados gerais, TR, QQP → **Salvar rascunho**
4. Na revisão → **Submeter** → status **Submetido** na listagem

Spec: `meta_specs/business/contratacao-wizard-v1.md`

## Passo 5 — Identidade (implementado)

- Login mínimo: `/auth/login`
- `GET /api/v1/me/modulos` como fonte do menu
- `ContratacaoGuard` protege `/contratacao`
- Menu dinâmico no shell (item Contratação só se a API liberar)

## Desenvolvimento local

1. Adicionar ao `hosts`:

```
127.0.0.1 portalfornecedor.clientex.local
127.0.0.1 api.portalfornecedor.local
```

2. API Laravel rodando em `http://api.portalfornecedor.local`

3. Front:

```bash
npm install
npm start -- --host portalfornecedor.clientex.local --port 4200
```

4. Acessar `http://portalfornecedor.clientex.local:4200/auth/login`

Credenciais demo: `admin@clientex.local` / `password`

## Build

```bash
npm run build
```

## Testes

```bash
npm test
```

## Documentação

Specs em `meta_specs/` no monorepo (`Portal_Fornecedor_new-ondemo`).
