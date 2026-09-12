"use client";

/**
 * Generative UI, controlled tier.
 *
 * `useComponent` gives the agent a catalog of *your* components and lets it
 * choose one and fill in the props, so chat output stays on-brand.
 *
 * Note what is NOT here: there is no approval gate in chat. The Decision Desk
 * has exactly one approval control, and it lives in the page next to the
 * commitments it would create. Giving the agent a second one would let a
 * conversation authorize a write, which this project forbids.
 *
 * Renderers receive streamed partial arguments before schema defaults apply.
 */
import { useComponent } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DecisionBrief } from "./decision-desk/decision-brief";
import { Timeline } from "./streamed-cards";

export function GenerativeUI() {
  useComponent({
    name: "decision_brief",
    description:
      "Draw where the selected decision stands right now. Call this after reading the page context, and again when the picture changes.",
    parameters: z.object({
      decision: z.string().describe("The decision in under ten words."),
      standing: z
        .string()
        .describe("What is settled and what is still open, in one sentence."),
      blocking: z
        .array(z.string())
        .max(3)
        .default([])
        .describe("What specifically blocks the decision. Real gaps only."),
      nextSteps: z.array(z.string()).max(3).default([]),
      readiness: z.enum(["blocked", "forming", "ready"]).default("forming"),
    }),
    render: DecisionBrief,
  });

  useComponent({
    name: "timeline",
    description:
      "Draw an ordered table of what happened when. Call this when there are three or more events worth ordering.",
    parameters: z.object({
      title: z.string().optional(),
      columns: z.array(z.string()).min(1).max(4),
      rows: z.array(z.array(z.string())),
    }),
    render: Timeline,
  });

  // Hooks register into the chat stream, so this component renders nothing.
  return null;
}
