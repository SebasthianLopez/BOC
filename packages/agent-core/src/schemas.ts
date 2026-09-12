/**
 * Isomorphic schemas and types. Safe in a browser bundle — no Node imports.
 */
import { z } from "zod";

/** Browser-safe copy for a visible Decision Desk research limitation. */
export const EXA_UNAVAILABLE_MESSAGE =
  "No puedo investigar fuentes públicas porque EXA_API_KEY no está configurada. No agregué evidencia ni inferí datos de proveedores.";

export const searchWebParameters = z.object({
  query: z.string().describe("What to search for, phrased as a natural-language question."),
  results: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .describe("How many results to return. Keep it small; a thread is not a search page."),
});

export type SearchWebArgs = z.infer<typeof searchWebParameters>;

export interface SearchHit {
  title: string;
  url: string;
  published?: string;
  highlight?: string;
}

/** Shared Decision Desk contracts. Keep these independent of any app package. */
export const criterionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  weight: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
});

export const evidenceSchema = z.object({
  id: z.string().min(1),
  alternativeId: z.string().min(1),
  criterionId: z.string().min(1).optional(),
  claim: z.string().min(1),
  url: z.url(),
  source: z.string().min(1),
  addedBy: z.union([z.literal("agent"), z.literal("user")]),
});

export const alternativeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  evidence: z.array(evidenceSchema),
});

export const decisionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  context: z.string().min(1),
  successCriteria: z.string().min(1).optional(),
  owner: z.string().min(1).optional(),
  participants: z.array(z.string().min(1)),
  criteria: z.array(criterionSchema),
  alternatives: z.array(alternativeSchema),
  notes: z.array(z.string()),
  status: z.union([z.literal("open"), z.literal("decided")]),
});

export const gapSchema = z.object({
  kind: z.union([z.literal("evidence"), z.literal("owner"), z.literal("criteria")]),
  alternativeId: z.string().min(1).optional(),
  criterionId: z.string().min(1).optional(),
  message: z.string().min(1),
});

export const commitmentSchema = z.object({
  title: z.string().min(1),
  owner: z.string().min(1),
  dueDate: z.string().min(1),
});

export const proposalSchema = z.object({
  decisionId: z.string().min(1),
  recommendation: z.string().min(1),
  rationale: z.string().min(1),
  commitments: z.array(commitmentSchema),
});

export const detectGapsParameters = decisionSchema;

/** Calling this schema is the explicit research request gate. */
export const researchAlternativeParameters = z.object({
  decision: decisionSchema,
  alternativeId: z.string().min(1),
  query: z.string().min(1),
  criterionId: z.string().min(1).optional(),
  results: z.number().int().min(1).max(10).default(5),
});

export const proposeDecisionParameters = z.object({
  decision: decisionSchema,
});

export type Criterion = z.infer<typeof criterionSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type Alternative = z.infer<typeof alternativeSchema>;
export type Decision = z.infer<typeof decisionSchema>;
export type Gap = z.infer<typeof gapSchema>;
export type Commitment = z.infer<typeof commitmentSchema>;
export type Proposal = z.infer<typeof proposalSchema>;
export type ResearchAlternativeArgs = z.input<typeof researchAlternativeParameters>;
