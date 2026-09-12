import type { CommitmentsStatus, Decision, Gap, Proposal } from "./contract";

/**
 * Lo que el agente sabe de esta página, con la forma justa para que pueda
 * señalar una celda concreta en vez de hablar en general. Puro, para testearlo.
 */
export function decisionContext(input: {
  decision: Decision;
  gaps: Gap[];
  proposal?: Proposal;
  status?: CommitmentsStatus;
}) {
  const { decision, gaps, proposal, status } = input;
  return {
    selectedDecision: {
      id: decision.id,
      title: decision.title,
      context: decision.context,
      successCriteria: decision.successCriteria ?? null,
      owner: decision.owner ?? null,
      participants: decision.participants,
      status: decision.status,
      notes: decision.notes,
      criteria: decision.criteria,
      alternatives: decision.alternatives.map((alternative) => ({
        id: alternative.id,
        name: alternative.name,
        summary: alternative.summary,
        evidence: alternative.evidence,
        /** Criterios sin nada detrás: huecos candidatos, ya calculados. */
        criteriaWithoutEvidence: decision.criteria
          .filter(
            (criterion) =>
              !alternative.evidence.some(
                (item) => item.criterionId === criterion.id,
              ),
          )
          .map((criterion) => criterion.id),
      })),
    },
    visibleGaps: gaps,
    stagedProposal: proposal ?? null,
    commitments:
      status?.status === "connected"
        ? status.commitments
        : { unavailable: status?.message ?? "Not checked yet." },
  };
}

export const decisionContextDescription =
  "The decision the user is looking at right now: alternatives, criteria, the evidence behind each cell, notes, the gaps already on screen, and any staged proposal. This page is written in Spanish; answer in Spanish. " +
  "Use this context before answering; it is the shared state, not background trivia. " +
  "CRITICAL: open_proposal only stages commitments for review. Only the user's Approve button in the page can create anything in Ambiguous, and agreement in chat never counts as approval. " +
  "Never invent evidence, URLs, sources, commitment IDs, or record links. If research is unavailable, say so plainly and attach nothing.";
