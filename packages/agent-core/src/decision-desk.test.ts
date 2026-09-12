import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Exa } from "exa-js";
import {
  detectGaps,
  OFFICIAL_DUE_DATE,
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
import { decisionDeskAgentConfig } from "./agent";
import { DECISION_DESK_ROLE } from "./prompt";
import type { Decision } from "./schemas";

const decision: Decision = {
  id: "payments-boc",
  title: "Pasarela de pagos para BOC Academy",
  context: "Vender un curso online a clientes de Paraguay y Brasil.",
  participants: ["Valeria", "Diego", "Sofía"],
  criteria: [
    { id: "payment-methods", name: "Cobertura de métodos de pago en Paraguay y Brasil" },
    { id: "transaction-cost", name: "Costo total por transacción" },
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
  assert.deepEqual(proposal.commitments.map(({ dueDate }) => dueDate), [
    OFFICIAL_DUE_DATE,
    OFFICIAL_DUE_DATE,
  ]);
  assert.equal(proposal.commitments.some(({ dueDate }) => /^\d{4}-\d{2}-\d{2}$/.test(dueDate)), false);
});

test("prompt requires propose_decision before an unchanged visual proposal", () => {
  assert.match(DECISION_DESK_ROLE, /FIRST call the server tool\s+propose_decision/);
  assert.match(DECISION_DESK_ROLE, /open_proposal\s+once with that exact returned Proposal object/);
  assert.match(DECISION_DESK_ROLE, /never construct a Proposal yourself/);
  assert.match(DECISION_DESK_ROLE, /never invent an ISO date/);
});

test("researchAlternative returns no invented evidence without EXA_API_KEY", async () => {
  delete process.env.EXA_API_KEY;
  assert.match(EXA_UNAVAILABLE_MESSAGE, /EXA_API_KEY/);
  assert.deepEqual(await researchAlternative({
    decision,
    alternativeId: "dlocal",
    criterionId: "transaction-cost",
    query: "dLocal costos por transacción",
  }), []);
});

test("research_alternative preserves an Exa result URL as Evidence[]", async () => {
  const originalSearch = Exa.prototype.searchAndContents;
  process.env.EXA_API_KEY = "test-key";
  (Exa.prototype.searchAndContents as unknown as (query: string, options: unknown) => Promise<unknown>) = async () => ({
    results: [{
      id: "exa-result-dlocal",
      title: "dLocal payment methods in Paraguay and Brazil",
      url: "https://www.dlocal.com/",
      highlights: ["dLocal supports local payment methods in Paraguay and Brazil."],
    }],
  });
  try {
    const evidence = await researchAlternative({
      decision,
      alternativeId: "dlocal",
      criterionId: "payment-methods",
      query: "dLocal Paraguay Brasil métodos de pago locales",
    });
    assert.deepEqual(evidence, [{
      id: "exa-result-dlocal",
      alternativeId: "dlocal",
      criterionId: "payment-methods",
      claim: "dLocal supports local payment methods in Paraguay and Brazil.",
      url: "https://www.dlocal.com/",
      source: "dLocal payment methods in Paraguay and Brazil",
      addedBy: "agent",
    }]);
  } finally {
    Exa.prototype.searchAndContents = originalSearch;
  }
});

test("coverage and transaction cost research stay in separate criterion-specific Evidence arrays", async () => {
  const originalSearch = Exa.prototype.searchAndContents;
  const queries: string[] = [];
  process.env.EXA_API_KEY = "test-key";
  (Exa.prototype.searchAndContents as unknown as (query: string, options: unknown) => Promise<unknown>) = async (query) => {
    queries.push(query);
    if (query.includes("métodos locales")) {
      return {
        results: [
          {
            id: "exa-coverage",
            title: "dLocal local payment methods",
            url: "https://www.dlocal.com/payment-methods",
            highlights: ["dLocal supports local payment methods in Paraguay and Brazil."],
          },
          {
            id: "exa-price-misplaced",
            title: "dLocal pricing",
            url: "https://www.dlocal.com/pricing",
            highlights: ["Transaction fees depend on the market."],
          },
        ],
      };
    }
    return {
      results: [
        {
          id: "exa-cost",
          title: "dLocal transaction pricing",
          url: "https://www.dlocal.com/pricing",
          highlights: ["Transaction fees depend on the market and payment method."],
        },
        {
          id: "exa-coverage-misplaced",
          title: "dLocal local payment methods",
          url: "https://www.dlocal.com/payment-methods",
          highlights: ["dLocal supports local payment methods in Paraguay and Brazil."],
        },
      ],
    };
  };
  try {
    const coverage = await researchAlternative({
      decision,
      alternativeId: "dlocal",
      criterionId: "payment-methods",
      query: "dLocal métodos locales Paraguay Brasil",
    });
    const costs = await researchAlternative({
      decision,
      alternativeId: "dlocal",
      criterionId: "transaction-cost",
      query: "dLocal costos por transacción",
    });
    assert.deepEqual(queries, [
      "dLocal métodos locales Paraguay Brasil",
      "dLocal costos por transacción",
    ]);
    assert.deepEqual(coverage, [{
      id: "exa-coverage",
      alternativeId: "dlocal",
      criterionId: "payment-methods",
      claim: "dLocal supports local payment methods in Paraguay and Brazil.",
      url: "https://www.dlocal.com/payment-methods",
      source: "dLocal local payment methods",
      addedBy: "agent",
    }]);
    assert.deepEqual(costs, [{
      id: "exa-cost",
      alternativeId: "dlocal",
      criterionId: "transaction-cost",
      claim: "Transaction fees depend on the market and payment method.",
      url: "https://www.dlocal.com/pricing",
      source: "dLocal transaction pricing",
      addedBy: "agent",
    }]);
  } finally {
    Exa.prototype.searchAndContents = originalSearch;
  }
});

test("prompt requires separate research and attachment for coverage and costs", () => {
  assert.match(DECISION_DESK_ROLE, /A research_alternative call covers exactly one criterionId/);
  assert.match(DECISION_DESK_ROLE, /criterionId "payment-methods"[\s\S]*then attach that Evidence\[\]/);
  assert.match(DECISION_DESK_ROLE, /criterionId "transaction-cost"[\s\S]*attach that separate Evidence\[\]/);
  assert.match(DECISION_DESK_ROLE, /Never put pricing\s+documents under payment-methods/);
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
      criterionId: "payment-methods",
      query: "dLocal Paraguay Brasil",
      results: 5,
    }),
    new RegExp(EXA_UNAVAILABLE_MESSAGE),
  );
  assert.equal(proposalSchema.parse(await propose({ decision })).decisionId, decision.id);
});

test("runtime configuration registers P2 tools and no MCP/write surface", () => {
  const config = decisionDeskAgentConfig("openai:gpt-test");
  assert.deepEqual(config.tools.map((tool) => tool.name), [
    "detect_gaps",
    "research_alternative",
    "propose_decision",
  ]);
  assert.deepEqual(config.mcpServers, []);
  assert.equal(config.maxSteps, 10);
});
