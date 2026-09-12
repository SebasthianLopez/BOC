# BOC — guía para P1, P2 y P3

Jhonatan es P4 e integra los cambios. P1, P2 y P3 trabajan aislados en su rama,
no hacen push a `main` y no modifican archivos de otros roles.

## Preparación inicial

1. Pedí al propietario de `SebasthianLopez/BOC` acceso de escritura.
2. Instalá Git y Node.js 22 o superior.
3. Cloná el repositorio e instalá dependencias:

   ```powershell
   git clone https://github.com/SebasthianLopez/BOC.git
   cd BOC
   npm ci
   Copy-Item .env.example .env
   ```

4. Configurá tu identidad de commit con el correo verificado en GitHub:

   ```powershell
   git config user.name "Tu nombre"
   git config user.email "tu-correo-verificado-en-github@example.com"
   ```

`.env` es local: nunca se agrega a Git ni se comparte por chat. Las keys de
OpenRouter, Exa y Ambiguous se solicitan a P4.

## Rama por rol

```powershell
git switch main
git pull --ff-only origin main
```

| Rol | Rama |
| --- | --- |
| P1 | `p1/decision-map` |
| P2 | `p2/decision-agent` |
| P3 | `p3/decision-commitments` |

Creá tu rama una sola vez, por ejemplo:

```powershell
git switch -c p2/decision-agent
```

## Prompt obligatorio para tu IA

Abrí Codex o Claude Code desde la raíz `BOC` y pegá el prompt de tu rol.

### P1

```text
Soy P1 de Decision Desk. Leé AGENTS.md, PROYECTO.md completo y
.agents/skills/decision-desk-p1-frontend/SKILL.md antes de editar. Aplicá la
skill como regla obligatoria; solo puedo modificar components y app/page.tsx.
Mostrame el plan archivo por archivo antes de editar.
```

### P2

```text
Soy P2 de Decision Desk. Leé AGENTS.md, PROYECTO.md completo y
.agents/skills/decision-desk-p2-agent/SKILL.md antes de editar. Aplicá la
skill como regla obligatoria; solo puedo modificar packages/agent-core/**.
Mostrame el plan archivo por archivo antes de editar.
```

### P3

```text
Soy P3 de Decision Desk. Leé AGENTS.md, PROYECTO.md completo y
.agents/skills/decision-desk-p3-server/SKILL.md antes de editar. Aplicá la
skill como regla obligatoria; solo puedo modificar apps/web/src/lib/** y
apps/web/src/app/api/**. Mostrame el plan archivo por archivo antes de editar.
```

En Codex se puede invocar además `$decision-desk-p1-frontend` (o la skill del
rol). La ruta explícita del prompt es el procedimiento compatible con Codex y
Claude Code.

## Entregar tu trabajo

1. Ejecutá los checks indicados por tu skill.
2. Confirmá alcance y whitespace:

   ```powershell
   git status --short
   git diff --check
   ```

3. Pedí a tu IA, o hacelo manualmente, que agregue únicamente tus archivos:

   ```powershell
   git add RUTA-DE-TUS-ARCHIVOS
   git commit -m "feat: descripcion corta"
   git push -u origin NOMBRE-DE-TU-RAMA
   ```

4. Abrí un Pull Request hacia `main` que indique archivos modificados, checks
   ejecutados y cualquier dependencia pendiente.

Nunca uses `git add .`, `git push origin main` ni `--force`. Si aparece un
conflicto o un archivo ajeno, detenete y avisá a P4.
