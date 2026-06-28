# PF_new_ondemo_front

Front-end **Portal Fornecedor On Demand** — Angular 17+, PrimeNG, multi-tenant por hostname.

## Stack

- Angular + PrimeNG
- JWT (API Laravel)
- Portais: colaborador (tenant) e fornecedor (global)

## Desenvolvimento local

Com Docker Compose no monorepo:

```bash
docker compose --env-file .env up -d --build
```

URLs locais (após configurar `hosts`):

- `http://portalfornecedor.clientex.local`
- `http://portaldofornecedor.fornecedor.local`
- API: `http://api.portalfornecedor.local`

## Build homolog

```bash
npm ci
npm run build -- --configuration production
```

## Documentação

Especificações em `meta_specs/` no monorepo local (`Portal_Fornecedor_new-ondemo`).
