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

Pré-requisito: migrations aplicadas no Postgres (`php artisan migrate --force` em `PF_ondemo_Back` — ver setup local abaixo). Sem isso, **Submeter** falha com `relation "contratacoes" does not exist`.

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

### Windows + Supabase (sem Docker)

1. **Hosts (obrigatório)** — senão o browser mostra `DNS_PROBE_FINISHED_NXDOMAIN`:

   CMD ou PowerShell **como Administrador** na raiz do monorepo:

   ```cmd
   scripts\windows-add-hosts.cmd
   ```

   Se preferir PowerShell e der erro de ExecutionPolicy:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\windows-add-hosts.ps1
   ```

2. **Backend** — `.env` em `PF_ondemo_Back` apontando para Supabase (`env/laravel.local.supabase.example`).

3. **Migrations (obrigatório na 1ª vez e após novas features)** — cria tabelas como `contratacoes` usadas pelo wizard:

   ```powershell
   cd PF_ondemo_Back
   php artisan migrate --force
   ```

   Idempotente: migrations que checam `Schema::hasTable` não recriam tabelas já existentes.

4. **Subir tudo** (API na porta 8000 + Angular):

   ```powershell
   .\scripts\dev-local-supabase.ps1
   ```

5. Acessar `http://portalfornecedor.clientex.local:4200/auth/login`

   Credenciais demo: `admin@clientex.local` / `password`

> **Supabase** é só o banco Postgres. Não abre URL no browser — o front roda no seu PC (`ng serve`).

### Docker (monorepo)

1. Entradas no `hosts` (mesmos domínios `.local`).
2. `docker compose up` — API em `http://api.portalfornecedor.local` (porta 80).
3. Ajuste `environment.ts` para `http://api.portalfornecedor.local/api` (sem `:8000`).
4. `npm start -- --host portalfornecedor.clientex.local --port 4200`

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
