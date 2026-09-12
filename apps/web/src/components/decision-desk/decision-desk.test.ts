import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { initialDecision, initialGaps } from "@/lib/decisions";
import { decisionContext } from "./agent-context";
import type { Evidence, Gap } from "./contract";
import { DecisionBrief } from "./decision-brief";
import { rejectUnknownEvidence, rejectUnknownGaps } from "./guards";

const decision = initialDecision;
const [alternativeId] = decision.alternatives.map((item) => item.id);
const [criterionId] = decision.criteria.map((item) => item.id);

function evidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: "ev-1",
    alternativeId,
    criterionId,
    claim: "Pagina de precios publicada.",
    url: "https://dlocal.com/",
    source: "dlocal.com",
    addedBy: "agent",
    ...overrides,
  };
}

/**
 * La pagina depende de la forma de los datos de P3. Si P3 cambia el caso de
 * manera que la matriz o los huecos dejan de tener sentido, esto lo marca aca
 * en vez de en la demo.
 */
test("el caso de P3 es el que la pagina sabe dibujar", () => {
  assert.equal(decision.alternatives.length, 2);
  assert.ok(decision.criteria.length >= 2);
  assert.equal(decision.status, "open");
  assert.ok(decision.participants.length > 0);
  for (const alternative of decision.alternatives) {
    // Las celdas arrancan vacias a proposito: son los huecos del guion.
    assert.deepEqual(alternative.evidence, []);
  }
});

test("los huecos iniciales de P3 apuntan a ids que existen en la pagina", () => {
  assert.equal(initialGaps.length, 3);
  assert.deepEqual(rejectUnknownGaps(decision, initialGaps), []);
});

test("se rechaza la evidencia que apunta a algo que no esta en la pagina", () => {
  assert.deepEqual(rejectUnknownEvidence(decision, [evidence()]), []);
  const problems = rejectUnknownEvidence(decision, [
    evidence({ alternativeId: "alt-inventada" }),
    evidence({ criterionId: "intuicion" }),
    evidence({ url: "no-es-una-url" }),
  ]);
  assert.equal(problems.length, 3);
  assert.match(problems.join(" "), /alt-inventada/);
  assert.match(problems.join(" "), /intuicion/);
  assert.match(problems.join(" "), /URL http\(s\) real/);
});

test("se rechazan los huecos que apuntan a algo que no esta en la pagina", () => {
  const buenos: Gap[] = [
    { kind: "evidence", alternativeId, criterionId, message: "Falta evidencia." },
    { kind: "owner", message: "Nadie valida el contrato." },
  ];
  assert.deepEqual(rejectUnknownGaps(decision, buenos), []);
  const malos = rejectUnknownGaps(decision, [
    { kind: "evidence", alternativeId: "fantasma", message: "x" },
  ]);
  assert.equal(malos.length, 1);
  assert.match(malos[0], /fantasma/);
});

test("el contexto del agente nombra las celdas vacias para que pueda citarlas", () => {
  const context = decisionContext({
    decision,
    gaps: initialGaps,
    status: { status: "unconfigured", message: "sin conectar" },
  });
  const todos = decision.criteria.map((item) => item.id);
  for (const alternative of context.selectedDecision.alternatives) {
    assert.deepEqual(alternative.criteriaWithoutEvidence, todos);
  }
  assert.equal(context.visibleGaps.length, 3);
  assert.deepEqual(context.commitments, { unavailable: "sin conectar" });
  assert.equal(context.stagedProposal, null);
});

test("una celda con evidencia deja de contar como hueco en el contexto", () => {
  const conEvidencia = {
    ...decision,
    alternatives: decision.alternatives.map((alternative) =>
      alternative.id === alternativeId
        ? { ...alternative, evidence: [evidence()] }
        : alternative,
    ),
  };
  const context = decisionContext({ decision: conEvidencia, gaps: [] });
  const tocada = context.selectedDecision.alternatives.find(
    (item) => item.id === alternativeId,
  );
  assert.ok(tocada);
  assert.ok(!tocada.criteriaWithoutEvidence.includes(criterionId));
  assert.equal(tocada.criteriaWithoutEvidence.length, decision.criteria.length - 1);
});

test("el contexto informa compromisos reales cuando el proveedor los devolvio", () => {
  const context = decisionContext({
    decision,
    gaps: [],
    status: {
      status: "connected",
      workspaceId: "ws-1",
      identityName: "Valeria",
      commitments: [
        {
          title: "Prueba de integracion con dLocal",
          owner: "Diego",
          dueDate: "2026-09-19",
          ambiguousId: "AMB-1",
          url: "https://ambiguous.ai/task/AMB-1",
        },
      ],
    },
  });
  assert.ok(Array.isArray(context.commitments));
});

test("el card de chat muestra placeholders antes de que lleguen los argumentos", () => {
  const html = renderToStaticMarkup(createElement(DecisionBrief, {}));
  assert.match(html, /Leyendo la decisi/);
  assert.match(html, /Viendo c/);
});

test("el card de chat tolera arreglos parciales y muestra el color de estado", () => {
  const html = renderToStaticMarkup(
    createElement(DecisionBrief, {
      decision: "Pasarela de pagos",
      readiness: "blocked",
      blocking: [null, "Sin evidencia de costo para dLocal"],
      nextSteps: ["Investigar cobertura en Paraguay y Brasil"],
    }),
  );
  assert.match(html, /Pasarela de pagos/);
  assert.match(html, /var\(--dd-attention\)/);
  assert.match(html, /Sin evidencia de costo para dLocal/);
  assert.match(html, /Cargando/);
});
