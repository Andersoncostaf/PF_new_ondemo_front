# PF_ondemo_Front

Front-end **Portal Fornecedor On Demand** — Angular 17, PrimeNG, multi-tenant por hostname.

## Stack

- Angular 17 (standalone)
- PrimeNG + PrimeIcons
- JWT via API Laravel (`PF_ondemo_Back`)

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
