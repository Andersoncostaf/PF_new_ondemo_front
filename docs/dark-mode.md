# Dark mode — contrato e checklist

## Preferência do usuário

| Modo | Comportamento |
|------|----------------|
| `light` | Sempre claro |
| `dark` | Sempre escuro |
| `system` | Segue `prefers-color-scheme` do SO |

Persistência local: `localStorage` chave `pf_theme_preference`.  
Persistência servidor (usuário autenticado): `usuarios_cliente.preferencias.theme` via `PATCH /api/v1/me/preferencias`.

## Tokens CSS (`src/styles.scss`)

Definidos em `:root` / `[data-theme="light"]` e `[data-theme="dark"]`:

- `--text-primary`, `--text-secondary`
- `--surface-ground`, `--surface-elevated`, `--surface-muted`
- `--border-subtle`, `--danger`, `--brand-blue`, `--brand-green`
- `--shadow-color`, `--overlay-scrim`
- `--gradient-panel-*`, `--wizard-header-*`

Regra: superfícies e textos novos usam `var(--token)`, não hex soltos.

## Controle na UI

- Shell: `app-theme-toggle` no footer da sidebar
- Auth (login/cadastro): toggle compacto no canto superior direito
- Logos: `logo-horizontal.png` (light) / `logo-inverted.png` (dark)

## Checklist manual

- [ ] Claro / Escuro / Sistema no shell; persiste após F5
- [ ] Login já em dark (sem flash branco)
- [ ] Mobile: sidebar + topbar
- [ ] Wizard contratação, dialogs, tabelas
- [ ] Editor Quill legível em dark
- [ ] Após login, tema do servidor aplica; troca sync via PATCH
