import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { decisionContext } from "./agent-context";
import type { Evidence, Gap } from "./contract";
import { DecisionBrief } from "./decision-brief";
import { initialGaps, officialDecision } from "./official-case";
import {
  rejectUnknownEvidence,
  rejectUnknownGaps,
  withEvidence,
} from "./use-decision-desk";

const decision = officialDecision;

function evidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: "ev-1",
    alternativeId: "alt-dlocal",
    criterionId: "costo",
    claim: "Pagina de precios publicada.",
    url: "https://dlocal.com/",
    source: "dlocal.com",
    addedBy: "agent",
    ...overrides,
  };
}

test("el caso oficial es el de PROYECTO.md: Stripe vs dLocal, 4 criterios", () => {
  assert.equal(decision.id, "DEC-payments");
  assert.deepEqual(
    decision.alternatives.map((item) => item.name),
    ["Stripe", "dLocal"],
  );
  assert.deepEqual(
    decision.criteria.map((item) => item.id),
    ["cobertura", "costo", "integracion", "cumplimiento"],
  );
  assert.equal(decision.participants.length, 3);
  assert.equal(decision.status, "open");
});

test("ninguna alternativa arranca con evidencia: esa es la foto inicial correcta", () => {
  for (const alternative of decision.alternatives) {
    assert.deepEqual(alternative.evidence, []);
  }
});

test("los tres huecos iniciales estan sembrados y apuntan a criterios reales", () => {
  assert.equal(initialGaps.length, 3);
  const problems = rejectUnknownGaps(decision, initialGaps);
  assert.deepEqual(problems, []);
  assert.deepEqual(
    initialGaps.map((gap) => gap.kind),
    ["evidence", "evidence", "owner"],
  );
  // El guion pide costo y cobertura sin evidencia, y el compromiso de Sofia sin duenio.
  assert.equal(initialGaps[0].criterionId, "costo");
  assert.equal(initialGaps[1].criterionId, "cobertura");
  assert.match(initialGaps[2].message, /Sof/);
});

test("withEvidence fija la evidencia solo en la alternativa que corresponde", () => {
  const merged = withEvidence(decision, [evidence()]);
  const dlocal = merged.alternatives.find((item) => item.id === "alt-dlocal");
  const stripe = merged.alternatives.find((item) => item.id === "alt-stripe");
  assert.equal(dlocal?.evidence.length, 1);
  assert.equal(stripe?.evidence.length, 0);
  // El caso oficial no se muta.
  assert.equal(
    decision.alternatives.find((item) => item.id === "alt-dlocal")?.evidence
      .length,
    0,
  );
});

test("withEvidence ignora una evidencia ya fijada", () => {
  const once = withEvidence(decision, [evidence()]);
  const twice = withEvidence(once, [evidence()]);
  assert.equal(
    twice.alternatives.find((item) => item.id === "alt-dlocal")?.evidence
      .length,
    1,
  );
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
    {
      kind: "evidence",
      alternativeId: "alt-dlocal",
      criterionId: "cumplimiento",
      message: "Sin evidencia de cumplimiento.",
    },
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
  const todos = ["cobertura", "costo", "integracion", "cumplimiento"];
  for (const alternative of context.selectedDecision.alternatives) {
    assert.deepEqual(alternative.criteriaWithoutEvidence, todos);
  }
  assert.equal(context.visibleGaps.length, 3);
  assert.deepEqual(context.commitments, { unavailable: "sin conectar" });
  assert.equal(context.stagedProposal, null);
});

test("una celda con evidencia deja de contar como hueco en el contexto", () => {
  const context = decisionContext({
    decision: withEvidence(decision, [evidence()]),
    gaps: [],
  });
  const dlocal = context.selectedDecision.alternatives.find(
    (item) => item.id === "alt-dlocal",
  );
  assert.ok(dlocal);
  assert.ok(!dlocal.criteriaWithoutEvidence.includes("costo"));
  assert.ok(dlocal.criteriaWithoutEvidence.includes("cobertura"));
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
          url: null,
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
  assert.match(html, /var\(--accent\)/);
  assert.match(html, /Sin evidencia de costo para dLocal/);
  assert.match(html, /Cargando/);
});
