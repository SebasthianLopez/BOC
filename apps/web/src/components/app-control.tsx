"use client";

import { useAgentContext, useFrontendTool } from "@copilotkit/react-core/v2";
import type { DecisionWorkplace } from "./decision-desk/contract";
import {
  decisionContext,
  decisionContextDescription,
} from "./decision-desk/agent-context";
import {
  attachEvidenceParameters,
  openProposalParameters,
  refreshCommitmentsParameters,
  showGapsParameters,
  toolDescriptions,
} from "./decision-desk/tool-schemas";
import {
  rejectUnknownEvidence,
  rejectUnknownGaps,
} from "./decision-desk/use-decision-desk";

async function toolResult<T>(action: () => Promise<T> | T) {
  try {
    return await action();
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The decision desk could not apply that. Check the page for details.",
    };
  }
}

/**
 * Everything the agent can do to this page. These tools are browser-side on
 * purpose: they move what the team sees. None of them writes to Ambiguous —
 * only the Approve control in the page can do that.
 *
 * The schemas and descriptions live in `decision-desk/tool-schemas.ts` so they
 * can be unit-tested and exercised against a real model without React.
 */
export function AppControl({ workplace }: { workplace: DecisionWorkplace }) {
  const {
    decision,
    gaps,
    proposal,
    status,
    showGaps,
    attachEvidence,
    openProposal,
    refresh,
  } = workplace;

  useAgentContext({
    description: decisionContextDescription,
    value: {
      ...decisionContext({ decision, gaps, proposal, status }),
      lastResult: workplace.notice,
      pageError: workplace.error,
    },
  });

  useFrontendTool(
    {
      name: "show_gaps",
      description: toolDescriptions.show_gaps,
      parameters: showGapsParameters,
      handler: async ({ gaps: next }) =>
        toolResult(() => {
          const problems = rejectUnknownGaps(decision, next);
          if (problems.length)
            return {
              status: "rejected",
              message: `Not shown. Use IDs from the page context: ${problems.join("; ")}.`,
            };
          showGaps(next);
          return `Showing ${next.length} gap(s) on the decision map.`;
        }),
    },
    [decision, showGaps],
  );

  useFrontendTool(
    {
      name: "attach_evidence",
      description: toolDescriptions.attach_evidence,
      parameters: attachEvidenceParameters,
      handler: async ({ evidence }) =>
        toolResult(() => {
          const problems = rejectUnknownEvidence(decision, evidence);
          if (problems.length)
            return {
              status: "rejected",
              message: `Nothing was pinned: ${problems.join("; ")}.`,
            };
          attachEvidence(evidence);
          return `Pinned ${evidence.length} piece(s) of evidence to ${decision.id}. It is now visible in the matrix.`;
        }),
    },
    [decision, attachEvidence],
  );

  useFrontendTool(
    {
      name: "open_proposal",
      description: toolDescriptions.open_proposal,
      parameters: openProposalParameters,
      handler: async (input) =>
        toolResult(() => {
          if (input.decisionId !== decision.id)
            return {
              status: "rejected",
              message: `The desk is showing ${decision.id}. Propose against ${decision.id}.`,
            };
          openProposal(input);
          return {
            status: "pending_approval",
            message: `Staged ${input.commitments.length} commitment(s) for ${decision.id}. Nothing was created. Wait for the user's Approve button.`,
          };
        }),
    },
    [decision, openProposal],
  );

  useFrontendTool(
    {
      name: "refresh_commitments",
      description: toolDescriptions.refresh_commitments,
      parameters: refreshCommitmentsParameters,
      handler: async () => toolResult(() => refresh()),
    },
    [refresh],
  );

  return null;
}
