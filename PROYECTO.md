# Decision Desk — especificación compartida

Este archivo es la fuente de verdad del equipo. Antes de editar, cada agente de
P1, P2 y P3 debe leer `AGENTS.md`, este documento completo y su `SKILL.md`.

## Producto

**Decision Desk** es un agente dentro de una decisión de equipo. La página
mantiene las alternativas, criterios, participantes, notas y evidencia; el
agente usa ese contexto para detectar qué falta, investigar bajo pedido y
proponer compromisos. No es un chatbot genérico.

El flujo único del MVP es:

```text
decisión visible → huecos → investigación solicitada → propuesta →
aprobar o rechazar → tareas persistentes
```

Reglas no negociables:

- El agente nunca decide ni escribe por su cuenta.
- Solo una aprobación explícita en la página permite crear tareas en Ambiguous.
- Rechazar crea cero tareas.
- La misma aprobación no duplica tareas.
- Las URLs, fuentes e IDs provienen de servicios reales; no se inventan. Si
  Ambiguous no entrega una URL individual, se conserva `url: null` y se
  verifica el registro mediante su ID en el workspace de prueba.
- Sin una key configurada, se informa la limitación de manera visible.

## Stack y límite de alcance

Usar solamente `apps/web`: Next.js + CopilotKit + OpenRouter + Exa +
Ambiguous. No tocar `apps/channel`, `apps/mobile`, Auth0, votos, múltiples
decisiones, edición avanzada, voz ni una base de datos propia durante el MVP.

## Caso oficial de demo y prueba

### Escenario

**Decisión:** elegir la pasarela de pagos para que BOC Academy pueda vender un
curso online a clientes de Paraguay y Brasil.

**Participantes:** Valeria (producto), Diego (ingeniería) y Sofía
(operaciones/compliance).

**Alternativas:**

| Alternativa | Resumen inicial |
| --- | --- |
| Stripe | Integración conocida por el equipo, pero la cobertura de los mercados objetivo debe verificarse. |
| dLocal | Ofrece métodos de pago locales, pero faltan datos comparables de costo, soporte y cumplimiento. |

**Criterios:**

1. Cobertura de métodos de pago en Paraguay y Brasil.
2. Costo total por transacción.
3. Esfuerzo de integración y soporte técnico.
4. Requisitos de cumplimiento y operación.

**Huecos iniciales que la aplicación debe mostrar:**

1. No hay evidencia comparable de costo por transacción para ninguna
   alternativa.
2. Falta confirmar, con una fuente real, qué métodos locales cubre cada
   proveedor en Paraguay y Brasil.
3. Sofía aún no tiene asignado el compromiso de validar cumplimiento y el
   contrato.

Los huecos son datos iniciales deliberados, no hechos inventados sobre los
proveedores. La investigación debe usar Exa y añadir únicamente fuentes reales
que devuelva el servicio.

### Guion verificable

1. Abrir la decisión "Pasarela de pagos para BOC Academy".
2. Mostrar alternativas, criterios y los tres huecos iniciales.
3. Pedir: "Investigá cobertura local y costos de dLocal para Paraguay y
   Brasil".
4. Mostrar evidencia devuelta por Exa con URL clicable; si Exa no está
   configurado, mostrar ese error honestamente.
5. Pedir una propuesta. La recomendación es **provisional**, nunca una decisión
   automática: enviar dLocal a prueba técnica mientras se valida costo y
   compliance.
6. Mostrar estos compromisos antes de escribir:

   - Diego: crear una prueba de integración/sandbox con dLocal antes del
     siguiente hito.
   - Sofía: solicitar cotización y validar requisitos de compliance antes del
     siguiente hito.

7. Rechazar la primera propuesta y comprobar que no se creó ninguna tarea.
8. Aprobar la segunda propuesta, mostrar IDs de Ambiguous y los enlaces que el
   proveedor entregue, verificar los registros en el workspace de prueba y
   recargar la página para comprobar persistencia.

## Contratos entre roles

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

P1–P3 deben respetar exactamente:

```ts
POST /api/followups
// recibe Proposal aprobada
// responde { commitments: [{ title, owner, dueDate, ambiguousId,
//   url: string | null }] }
```

Las herramientas P2–P1 devuelven exactamente `Gap[]`, `Evidence[]` y
`Proposal`.

## Reparto de trabajo

| Rol | Archivos autorizados |
| --- | --- |
| P1 — Frontend | `apps/web/src/components/**`, `apps/web/src/app/page.tsx` |
| P2 — Agente | `packages/agent-core/**` |
| P3 — Servidor | `apps/web/src/lib/**`, `apps/web/src/app/api/**` |
| P4 — Integración | Documentación, README, SUBMISSION, demo y Git |

P1, P2 y P3 no editan fuera de su alcance y nunca hacen push a `main`. P4
integra los Pull Requests; el orden recomendado es P3, P2 y P1.

P2 es el presentador y responsable de grabar el video oficial siguiendo
`DEMO_RUNBOOK.md`. P4 prepara el entorno integrado, supervisa la verificación y
revisa el archivo final antes de publicarlo. Esta responsabilidad de presentación
no amplía el alcance de código de P2.

## Verificación y entrega

Cada rol ejecuta los checks que indique su skill y `npm run typecheck` antes de
entregar. P4 ejecuta `npm run verify` sobre `main` integrado antes de grabar.
El README y `SUBMISSION.md` deben separar el starter heredado del trabajo hecho
durante el hackathon.
