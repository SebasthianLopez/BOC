import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Exa } from "exa-js";
import {
  detectGaps,
  proposeDecision,
  researchAlternative,
} from "./decision-desk";
import {
  decisionDeskTools,
  detectGapsTool,
  proposeDecisionTool,
  researchAlternativeTool,
} from "./decision-tools";
import { EXA_UNAVAILABLE_MESSAGE, gapSchema, proposalSchema } from "./schemas";
import type { Decision } from "./schemas";

const decision: Decision = {
  id: "payments-boc",
  title: "Pasarela de pagos para BOC Academy",
  context: "Vender un curso online a clientes de Paraguay y Brasil.",
  participants: ["Valeria", "Diego", "Sofía"],
  criteria: [
    { id: "coverage", name: "Cobertura de métodos de pago en Paraguay y Brasil" },
    { id: "cost", name: "Costo total por transacción" },
    { id: "integration", name: "Esfuerzo de integración y soporte técnico" },
    { id: "compliance", name: "Requisitos de cumplimiento y operación" },
  ],
  alternatives: [
    { id: "stripe", name: "Stripe", summary: "Integración conocida.", evidence: [] },
    { id: "dlocal", name: "dLocal", summary: "Métodos locales.", evidence: [] },
  ],
  notes: [],
  status: "open",
};

const originalExaKey = process.env.EXA_API_KEY;
afterEach(() => {
  if (originalExaKey === undefined) delete process.env.EXA_API_KEY;
  else process.env.EXA_API_KEY = originalExaKey;
});

test("detectGaps returns the three official initial gaps from page context", () => {
  assert.deepEqual(detectGaps(decision).map((gap) => gap.message), [
    "No hay evidencia comparable de costo por transacción para ninguna alternativa.",
    "Falta confirmar, con una fuente real, qué métodos locales cubre cada proveedor en Paraguay y Brasil.",
    "Sofía aún no tiene asignado el compromiso de validar cumplimiento y el contrato.",
  ]);
});

test("proposeDecision is provisional and contains the two reviewable commitments", () => {
  const proposal = proposeDecision(decision);
  assert.equal(proposal.decisionId, decision.id);
  assert.match(proposal.recommendation, /provisional/i);
  assert.match(proposal.recommendation, /dLocal/);
  assert.deepEqual(proposal.commitments.map(({ owner, title }) => ({ owner, title })), [
    { owner: "Diego", title: "Crear una prueba de integración/sandbox con dLocal" },
    { owner: "Sofía", title: "Solicitar cotización y validar requisitos de compliance" },
  ]);
});

test("researchAlternative returns no invented evidence without EXA_API_KEY", async () => {
  delete process.env.EXA_API_KEY;
  assert.match(EXA_UNAVAILABLE_MESSAGE, /EXA_API_KEY/);
  assert.deepEqual(await researchAlternative({
    decision,
    alternativeId: "dlocal",
    query: "dLocal Paraguay Brasil costos y métodos locales",
  }), []);
});

test("research_alternative preserves an Exa result URL as Evidence[]", async () => {
  const originalSearch = Exa.prototype.searchAndContents;
  process.env.EXA_API_KEY = "test-key";
  (Exa.prototype.searchAndContents as unknown as (query: string, options: unknown) => Promise<unknown>) = async () => ({
    results: [{
      id: "exa-result-dlocal",
      title: "dLocal",
      url: "https://www.dlocal.com/",
      highlights: ["dLocal provides cross-border payment infrastructure."],
    }],
  });
  try {
    const evidence = await researchAlternative({
      decision,
      alternativeId: "dlocal",
      criterionId: "coverage",
      query: "dLocal Paraguay Brasil métodos de pago locales",
    });
    assert.deepEqual(evidence, [{
      id: "exa-result-dlocal",
      alternativeId: "dlocal",
      criterionId: "coverage",
      claim: "dLocal provides cross-border payment infrastructure.",
      url: "https://www.dlocal.com/",
      source: "dLocal",
      addedBy: "agent",
    }]);
  } finally {
    Exa.prototype.searchAndContents = originalSearch;
  }
});

test("BuiltInAgent receives only the three read/prepare Decision Desk tools", async () => {
  assert.deepEqual(decisionDeskTools.map((tool) => tool.name), [
    "detect_gaps",
    "research_alternative",
    "propose_decision",
  ]);
  assert.equal(decisionDeskTools.some((tool) => /write|create|save|ambiguous/i.test(tool.name)), false);

  const detect = detectGapsTool.execute;
  const research = researchAlternativeTool.execute;
  const propose = proposeDecisionTool.execute;
  if (!detect || !research || !propose) {
    throw new Error("Decision Desk tools must have server-side executors.");
  }
  assert.equal(gapSchema.array().parse(await detect(decision)).length, 3);
  await assert.rejects(
    () => research({
      decision,
      alternativeId: "dlocal",
      query: "dLocal Paraguay Brasil",
      results: 5,
    }),
    new RegExp(EXA_UNAVAILABLE_MESSAGE),
  );
  assert.equal(proposalSchema.parse(await propose({ decision })).decisionId, decision.id);
});
