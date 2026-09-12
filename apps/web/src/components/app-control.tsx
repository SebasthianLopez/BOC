"use client";

import { useAgentContext, useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import type { DecisionWorkplace } from "./decision-desk/contract";
import {
  decisionContext,
  decisionContextDescription,
} from "./decision-desk/agent-context";
import {
  rejectUnknownEvidence,
  rejectUnknownGaps,
} from "./decision-desk/use-decision-desk";

/** Mirrors PROYECTO.md section 5 so the agent cannot send a shape the page cannot draw. */
const evidenceSchema = z.object({
  id: z.string().trim().min(1),
  alternativeId: z.string().trim().min(1),
  criterionId: z.string().trim().min(1).optional(),
  claim: z.string().trim().min(1).max(500),
  url: z.url(),
  source: z.string().trim().min(1).max(200),
  addedBy: z.enum(["agent", "user"]),
});

const gapSchema = z.object({
  kind: z.enum(["evidence", "owner", "criteria"]),
  alternativeId: z.string().trim().min(1).optional(),
  criterionId: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1).max(500),
});

const commitmentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  owner: z.string().trim().min(1).max(120),
  dueDate: z.string().trim().min(1).max(40),
});

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
      description:
        "Put the gaps you found onto the decision map as a Gap[] panel. A gap is missing evidence for an alternative/criterion pair, a missing owner, or a missing criterion. Point each gap at a real alternativeId or criterionId from the page context. Replaces the gaps currently shown.",
      parameters: z.object({ gaps: z.array(gapSchema).max(12) }),
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
      description:
        "Pin researched evidence onto an alternative, optionally against one criterion, so the whole team sees it in the matrix. Every item needs a real URL you actually retrieved. If research is unavailable, do not call this tool.",
      parameters: z.object({ evidence: z.array(evidenceSchema).min(1).max(8) }),
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
      description:
        "Stage a recommendation and its commitments in the page for the user to review. This does NOT create anything. CRITICAL: stop after calling it and wait for the user to press Approve in the page; approval in chat does not count.",
      parameters: z.object({
        decisionId: z.string(),
        recommendation: z.string().trim().min(1).max(300),
        rationale: z.string().trim().min(1).max(2000),
        commitments: z.array(commitmentSchema).min(1).max(6),
      }),
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
      description:
        "Re-read the commitments for the selected decision from Ambiguous. Read-only; use it to verify persistence after an approval or a page reload.",
      parameters: z.object({}),
      handler: async () => toolResult(() => refresh()),
    },
    [refresh],
  );

  return null;
}
