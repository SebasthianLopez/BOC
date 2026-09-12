# Decision Desk — prompts de trabajo para Codex y Claude Code

Cada integrante abre su IA desde la raíz del repositorio `BOC`, estando en su
propia rama. Copiá el bloque completo de tu rol, esperá el plan y solo entonces
autorizá la implementación. `PROYECTO.md` es la fuente de verdad del producto;
la skill impide que un rol invada el trabajo de otro.

## Stack único del MVP

Usamos solo el template web existente y sus dependencias ya instaladas:

- **Interfaz:** Next.js + TypeScript + CopilotKit React en `apps/web`.
- **Agente:** OpenAI Agents SDK existente, con modelo vía **OpenRouter**.
- **Investigación:** **Exa** como tool del agente.
- **Resultado persistente:** **Ambiguous** tras aprobación humana.

No agregar Python, Firebase, Auth0, Slack, móvil, otra base de datos ni otra
interfaz de chat durante el MVP. La suscripción de Codex o Claude Code sirve
para programar; no es una API que la aplicación pueda usar. La app necesita la
key de OpenRouter en `.env`. P4 administra las keys; `.env` nunca se commitea.

## P1 — Frontend

Pegá esto en Codex o Claude Code:

```text
Soy P1, responsable solo del frontend de Decision Desk. Antes de editar leé
AGENTS.md, PROYECTO.md completo, TEAM_SETUP.md y
.agents/skills/decision-desk-p1-frontend/SKILL.md. Respetá la skill como regla
obligatoria.

Mi alcance exclusivo es apps/web/src/components/** y apps/web/src/app/page.tsx.
No modifiques lib, api, packages, dependencias, .env, apps/channel ni
apps/mobile.

Construí la interfaz del caso oficial Stripe vs dLocal: mapa de decisión,
alternativas, criterios, huecos, evidencia por alternativa, tarjeta de
propuesta con Approve/Decline e historial de compromisos. El chat no puede
autorizar escrituras. Usá únicamente los contratos de PROYECTO.md.

Primero mostrám un plan archivo por archivo y los contratos de P2/P3 que vas a
consumir. Si decisions.ts o el adaptador de P3 todavía no existe, construí
componentes tipados que reciban props; no crees una implementación alternativa
en lib ni inventes endpoints. Después de que apruebe el plan, implementá,
ejecutá los checks web relevantes y reportá resultados exactos.
```

## P2 — Agente

Pegá esto en Codex o Claude Code:

```text
Soy P2, responsable solo del comportamiento del agente de Decision Desk. Antes
de editar leé AGENTS.md, PROYECTO.md completo, TEAM_SETUP.md y
.agents/skills/decision-desk-p2-agent/SKILL.md. Respetá la skill como regla
obligatoria.

Mi alcance exclusivo es packages/agent-core/**. No modifiques apps/web,
dependencias, .env, apps/channel ni apps/mobile.

Implementá el facilitador para el caso oficial Stripe vs dLocal. Debe leer el
contexto de la decisión, devolver Gap[], investigar solo cuando el usuario lo
pide y devolver Evidence[] con URLs reales de Exa, y proponer Proposal con
compromisos. Nunca decide por el equipo ni llama herramientas de escritura.
Sin EXA_API_KEY debe declarar la limitación sin inventar evidencia.

Primero mostrám un plan archivo por archivo y schemas Zod compatibles con
PROYECTO.md. Después de aprobarlo, implementá, ejecutá npm run typecheck y los
checks pertinentes, y reportá resultados y dependencias de P1/P3.
```

## P3 — Servidor

Pegá esto en Codex o Claude Code:

```text
Soy P3, responsable solo de datos, API y persistencia de Decision Desk. Antes
de editar leé AGENTS.md, PROYECTO.md completo, TEAM_SETUP.md y
.agents/skills/decision-desk-p3-server/SKILL.md. Respetá la skill como regla
obligatoria.

Mi alcance exclusivo es apps/web/src/lib/** y apps/web/src/app/api/**. No
modifiques components, page.tsx, packages, dependencias, .env, apps/channel ni
apps/mobile.

Implementá la decisión inicial Stripe vs dLocal exactamente como aparece en
PROYECTO.md. Creá los contratos de datos, la aprobación/rechazo y la
persistencia en Ambiguous. Approval recibe Proposal y responde exactamente
{ commitments: [{ title, owner, dueDate, ambiguousId, url }] }. Rechazar crea
cero tareas; una misma aprobación no duplica compromisos y el refresh los
relee por decisionId.

Primero mostrám un plan archivo por archivo, los casos de test y cómo se
preservan validación/origin/session/idempotencia. Después de aprobarlo,
implementá, ejecutá npm run typecheck y npm run test --workspace web, y
reportá los resultados exactos.
```

## Prompt de entrega para cualquier rol

Al terminar, cada persona pega esto en su IA:

```text
Revisá git status y git diff. Confirmá que los cambios pertenecen únicamente a
mi alcance y corré los checks requeridos. Si pasan, agregá solo esos archivos,
creá un commit descriptivo y hacé push solamente a mi rama actual. Nunca hagas
push a main, nunca uses --force, nunca agregues .env, secretos ni archivos de
otro rol. Mostrame el resultado y detenete si el remoto no es
https://github.com/SebasthianLopez/BOC.git.
```

Después deben abrir un Pull Request hacia `main` con archivos modificados,
checks ejecutados y bloqueos pendientes. P4 revisa e integra.
