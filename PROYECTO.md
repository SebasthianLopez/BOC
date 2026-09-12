# Decision Desk — guía de producto y contratos

Leé este archivo y `AGENTS.md` antes de editar. El proyecto de Breakfast of
Champions (BOC) para AI Tinkerers es **Decision Desk**: un agente dentro de una
decisión compartida, no un chatbot genérico.

## Objetivo del MVP

Un líder abre una decisión con dos o tres alternativas, criterios,
participantes y notas. El agente lee ese contexto, detecta huecos, investiga
solo cuando se le pide, propone compromisos y espera la aprobación humana.

Flujo que debe funcionar de principio a fin:

1. Mostrar una decisión con alternativas y criterios.
2. Mostrar `Gap[]` como panel de huecos.
3. Investigar una alternativa con Exa y adjuntar `Evidence[]` con URLs reales.
4. Mostrar una `Proposal` con recomendación y compromisos.
5. Aprobar o rechazar en la página; el chat nunca autoriza una escritura.
6. Solo al aprobar, crear tareas en Ambiguous y releerlas tras recargar.

Rechazar crea cero tareas. Una misma aprobación no puede duplicar tareas. Sin
Exa o Ambiguous configurado, la aplicación informa el límite: no inventa
fuentes, IDs ni resultados.

## Stack elegido

`apps/web` únicamente: Next.js + CopilotKit + OpenRouter + Exa + Ambiguous.
No tocar `apps/channel` ni `apps/mobile` para el MVP.

## Contrato de datos

```ts
type Decision = { id; title; context; successCriteria?: string; owner?: string;
  participants: string[]; criteria: Criterion[]; alternatives: Alternative[];
  notes: string[]; status: "open" | "decided" };
type Criterion = { id; name; weight?: 1 | 2 | 3 };
type Alternative = { id; name; summary; evidence: Evidence[] };
type Evidence = { id; alternativeId; criterionId?; claim; url; source;
  addedBy: "agent" | "user" };
type Gap = { kind: "evidence" | "owner" | "criteria"; alternativeId?;
  criterionId?; message };
type Proposal = { decisionId; recommendation; rationale;
  commitments: { title; owner; dueDate }[] };
```

La interfaz P1–P3 es:

```ts
POST /api/followups
// recibe Proposal aprobada
// devuelve { commitments: [{ title, owner, dueDate, ambiguousId, url }] }
```

La interfaz P2–P1 usa exactamente `Gap[]`, `Evidence[]` y `Proposal`.

## Roles y límites

| Rol | Solo puede modificar |
| --- | --- |
| P1 — Frontend | `apps/web/src/components/**`, `apps/web/src/app/page.tsx` |
| P2 — Agente | `packages/agent-core/**` |
| P3 — Servidor | `apps/web/src/lib/**`, `apps/web/src/app/api/**` |
| P4 — Integración | README, SUBMISSION, demo, documentación y coordinación Git |

P4 integra los PR; nadie hace push directo a `main`. Las instrucciones
operativas de cada rol viven en `.agents/skills/decision-desk-*`.

## Verificación y entrega

Antes de afirmar que algo funciona, ejecutar los checks que indique la skill y
como mínimo `npm run typecheck`. En la rama integrada, ejecutar
`npm run verify` antes de grabar.

El README y `SUBMISSION.md` deben distinguir el starter heredado de lo creado
durante el hackathon. El demo debe evidenciar una aprobación real con IDs o
links reales, o declarar honestamente una integración no configurada.
