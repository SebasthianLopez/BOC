# BOC — guía de trabajo para P1, P2 y P3

Esta guía explica cómo un integrante prepara su equipo y trabaja sin afectar el
trabajo de los demás. **Jhonatan (P4) integra los cambios**; P1, P2 y P3 no
hacen push a `main` ni modifican los archivos de otros roles.

## 0. Antes de empezar

1. El propietario del repositorio `SebasthianLopez/BOC` debe invitarte como
   colaborador con permiso de escritura. Sin esa invitación podrás clonar, pero
   no subir tu rama.
2. Instalá Node.js 22 o superior y Git.
3. No compartas claves personales ni subas `.env`, tokens, SSH keys, ni
   credenciales a GitHub.

## 1. Clonar y preparar tu copia

Usá HTTPS; no necesitás crear una clave SSH si GitHub te autentica desde el
navegador o con GitHub CLI.

```powershell
git clone https://github.com/SebasthianLopez/BOC.git
cd BOC
npm ci
Copy-Item .env.example .env
```

Las claves de OpenRouter, Exa y Ambiguous se pegan únicamente en tu archivo
local `.env`. Si todavía no hay una clave disponible, no inventes respuestas ni
fuentes: avisá al equipo y trabajá en las partes que no la requieran.

Configurá la identidad que aparecerá en tus commits. Usá el mismo correo que
tenés verificado en GitHub:

```powershell
git config user.name "Tu nombre"
git config user.email "tu-correo-verificado-en-github@example.com"
```

Comprobá que partís de la última versión:

```powershell
git switch main
git pull --ff-only origin main
```

## 2. Elegí una rama: una persona, un área

Cada persona crea y usa solamente su rama.

| Rol | Rama | Puede modificar |
| --- | --- | --- |
| P1 — Frontend | `p1/decision-map` | `apps/web/src/components/**`, `apps/web/src/app/page.tsx` |
| P2 — Agente | `p2/decision-agent` | `packages/agent-core/**` |
| P3 — Servidor | `p3/decision-commitments` | `apps/web/src/lib/**`, `apps/web/src/app/api/**` |
| P4 — Integración | `p4/*` | Documentación, demo, README, SUBMISSION y coordinación Git |

Ejemplo para P2:

```powershell
git switch -c p2/decision-agent
```

Si la rama ya existe en GitHub:

```powershell
git fetch origin
git switch p2/decision-agent
git pull --ff-only origin p2/decision-agent
```

## 3. Activar la guía correcta en Codex o Claude Code

Siempre iniciá Codex o Claude Code desde la carpeta raíz `BOC`. Antes de pedir
una tarea, enviá el prompt de tu rol. Esto funciona incluso si la IA no muestra
una skill en un selector visual.

### P1

```text
Soy P1 (frontend) en Decision Desk. Antes de editar, leé AGENTS.md,
PROYECTO.md completo y .agents/skills/decision-desk-p1-frontend/SKILL.md.
Usá esa skill como regla obligatoria. Solo podés modificar
apps/web/src/components/** y apps/web/src/app/page.tsx. No modifiques lib,
api, packages ni main. Decime el plan archivo por archivo antes de editar.
```

### P2

```text
Soy P2 (agente) en Decision Desk. Antes de editar, leé AGENTS.md,
PROYECTO.md completo y .agents/skills/decision-desk-p2-agent/SKILL.md.
Usá esa skill como regla obligatoria. Solo podés modificar
packages/agent-core/**. Respetá exactamente Gap[], Evidence[] y Proposal.
Decime el plan archivo por archivo antes de editar.
```

### P3

```text
Soy P3 (servidor) en Decision Desk. Antes de editar, leé AGENTS.md,
PROYECTO.md completo y .agents/skills/decision-desk-p3-server/SKILL.md.
Usá esa skill como regla obligatoria. Solo podés modificar apps/web/src/lib/**
y apps/web/src/app/api/**. Respetá exactamente los contratos definidos en
PROYECTO.md. Decime el plan archivo por archivo antes de editar.
```

En Codex también podés invocar la skill por nombre, por ejemplo
`$decision-desk-p2-agent`, pero el prompt anterior con la ruta explícita es el
procedimiento común para Codex y Claude Code.

## 4. Ciclo de trabajo

1. Pedí una tarea pequeña y concreta a tu IA.
2. Revisá los archivos que propone cambiar antes de que edite.
3. Ejecutá el check indicado por la skill. Como mínimo, antes de entregar:

   ```powershell
   npm run typecheck
   ```

4. Revisá que solo haya cambios de tu alcance:

   ```powershell
   git status --short
   git diff --check
   ```

5. No arregles archivos de otro rol. Informá el problema a P4 con el archivo,
   el error y el contrato afectado.

## 5. Commit, push y Pull Request seguros

Después de verificar el cambio, podés pedirle a Codex o Claude Code que prepare
el commit y push con este prompt:

```text
Revisá git status y git diff. Si y solo si los cambios pertenecen a mi alcance,
ejecutá los tests requeridos. Luego agregá únicamente esos archivos, creá un
commit descriptivo y hacé push solamente a mi rama actual. Nunca hagas push a
main, nunca uses --force, nunca agregues .env, claves ni archivos de otros
roles. Mostrame el resultado y detenete si el remoto no es
https://github.com/SebasthianLopez/BOC.git.
```

La persona también puede hacerlo manualmente:

```powershell
git add RUTA-DE-TUS-ARCHIVOS
git commit -m "feat: descripcion corta"
git push -u origin NOMBRE-DE-TU-RAMA
```

Luego abrí un Pull Request hacia `main`. El PR debe incluir:

- qué funcionalidad completó;
- archivos modificados;
- comandos ejecutados y resultado;
- cualquier dependencia pendiente (por ejemplo, una API key).

P4 revisa e integra los PR. Nadie hace merge de su propio cambio directamente
en `main` durante el hackathon.

## 6. Reglas de seguridad y coordinación

- Un PR por objetivo pequeño; no mezcles frontend, servidor y prompt del agente.
- Antes de comenzar una tarea nueva, hacé `git pull --ff-only origin main` y
  creá una rama nueva si el cambio es independiente.
- Si aparece un conflicto, no borres código: detenete y avisá a P4.
- Las skills en `.agents/skills/decision-desk-*` son compartidas. Solo P4 las
  cambia mediante PR para que todas las IAs reciban las mismas reglas.
- Los datos de demostración y los resultados de proveedores deben indicar su
  origen real; no se inventan fuentes, IDs ni tareas creadas.
