import { defineTool } from "@copilotkit/runtime/v2";
import {
  detectGaps,
  isExaConfigured,
  proposeDecision,
  researchAlternative,
} from "./decision-desk";
import {
  detectGapsParameters,
  EXA_UNAVAILABLE_MESSAGE,
  proposeDecisionParameters,
  researchAlternativeParameters,
} from "./schemas";

/** The complete read/prepare-only server tool surface for Decision Desk. */
export const detectGapsTool = defineTool({
  name: "detect_gaps",
  description: "Inspect the current Decision Desk page context and return Gap[]. Does not research or change data.",
  parameters: detectGapsParameters,
  execute: async (decision) => detectGaps(decision),
});

export const researchAlternativeTool = defineTool({
  name: "research_alternative",
  description: "Only after an explicit user research request, search Exa for exactly one criterionId and return its Evidence[] with real returned URLs. For the official coverage-and-cost request, call this twice: payment-methods with a coverage-only query, then transaction-cost with a cost-only query. Do not mix results or criterionIds. Never writes.",
  parameters: researchAlternativeParameters,
  execute: async (input) => {
    if (!isExaConfigured()) throw new Error(EXA_UNAVAILABLE_MESSAGE);
    return researchAlternative(input);
  },
});

export const proposeDecisionTool = defineTool({
  name: "propose_decision",
  description: "The sole source of a Decision Desk Proposal. Call this before open_proposal and pass its returned Proposal unchanged to that visual tool. It prepares exactly two official commitments with relative due dates; it never decides or creates tasks.",
  parameters: proposeDecisionParameters,
  execute: async ({ decision }) => proposeDecision(decision),
});

export const decisionDeskTools = [detectGapsTool, researchAlternativeTool, proposeDecisionTool];
