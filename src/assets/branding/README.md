# Branding — Portal Fornecedor On Demand

Arquivos gerados a partir da folha de logos (`logo-sheet-original.png`).

| Arquivo | Uso |
|---------|-----|
| `logo-horizontal.png` | Sidebar, login |
| `logo-icon.png` | Topbar mobile, ícone quadrado |
| `logo-monochrome.png` | Impressão / fundo claro |
| `logo-inverted.png` | Fundo escuro (footer, dark mode futuro) |
| `favicon-32.png` | Favicon do browser |
| `apple-touch-icon.png` | Atalho iOS |

Regenerar após trocar a folha original:

```bash
node scripts/split-logo.mjs src/assets/branding/logo-sheet-original.png src/assets/branding
```

Cores da marca (referência): azul `#3B82F6`, verde `#22C55E`, texto `#1E293B`.
