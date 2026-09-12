import { z } from "zod";

/**
 * Los schemas de las herramientas de la pagina, separados del componente para
 * que se puedan testear y ejercitar contra un modelo real sin arrastrar React.
 *
 * Espejan `PROYECTO.md` (Evidence, Gap, Proposal) para que el agente no pueda
 * mandar una forma que la pagina no sabe dibujar.
 */

export const evidenceSchema = z.object({
  id: z.string().trim().min(1),
  alternativeId: z.string().trim().min(1),
  criterionId: z.string().trim().min(1).optional(),
  claim: z.string().trim().min(1).max(500),
  url: z.url(),
  source: z.string().trim().min(1).max(200),
  addedBy: z.enum(["agent", "user"]),
});

export const gapSchema = z.object({
  kind: z.enum(["evidence", "owner", "criteria"]),
  alternativeId: z.string().trim().min(1).optional(),
  criterionId: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1).max(500),
});

export const commitmentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  owner: z.string().trim().min(1).max(120),
  dueDate: z.string().trim().min(1).max(40),
});

export const showGapsParameters = z.object({
  gaps: z.array(gapSchema).max(12),
});

export const attachEvidenceParameters = z.object({
  evidence: z.array(evidenceSchema).min(1).max(8),
});

export const openProposalParameters = z.object({
  decisionId: z.string(),
  recommendation: z.string().trim().min(1).max(300),
  rationale: z.string().trim().min(1).max(2000),
  commitments: z.array(commitmentSchema).min(1).max(6),
});

export const refreshCommitmentsParameters = z.object({});

export const toolDescriptions = {
  show_gaps:
    "Put the gaps you found onto the decision map as a Gap[] panel. A gap is missing evidence for an alternative/criterion pair, a missing owner, or a missing criterion. Point each gap at a real alternativeId or criterionId from the page context. This replaces the gaps currently shown, so include the ones that are still open.",
  attach_evidence:
    "Pin researched evidence onto an alternative, optionally against one criterion, so the whole team sees it in the matrix. Every item needs a real URL you actually retrieved from a search. If research is unavailable, do not call this tool: say so instead.",
  open_proposal:
    "Stage a provisional recommendation and its commitments in the page for the user to review. This does NOT create anything. CRITICAL: stop after calling it and wait for the user to press Approve in the page; approval in chat does not count.",
  refresh_commitments:
    "Re-read the commitments for this decision from Ambiguous. Read-only; use it to verify persistence after an approval or a page reload.",
} as const;
