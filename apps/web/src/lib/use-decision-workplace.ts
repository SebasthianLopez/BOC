"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialDecision, initialGaps, type Decision, type Evidence, type Gap, type Proposal } from "./decisions";
import type { Commitment, CommitmentsStatus } from "./followup-types";
import { requestFollowups as api } from "./followup-client";

export function useDecisionWorkplace() {
  const [attached, setAttached] = useState<Evidence[]>([]), [gaps, setGaps] = useState<Gap[]>(initialGaps), [proposal, setProposal] = useState<Proposal>(), [proposalId, setProposalId] = useState<string>(), [status, setStatus] = useState<CommitmentsStatus>(), [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const decision = useMemo<Decision>(() => ({ ...initialDecision, alternatives: initialDecision.alternatives.map((alternative) => ({ ...alternative, evidence: [...alternative.evidence, ...attached.filter((item) => item.alternativeId === alternative.id && !alternative.evidence.some((existing) => existing.id === item.id))] })) }), [attached]);
  const refresh = useCallback(async () => { try { const next = await api<CommitmentsStatus>(`?decisionId=${encodeURIComponent(initialDecision.id)}`); setStatus(next); setError(""); return next; } catch (cause) { const message = cause instanceof Error ? cause.message : "Unable to retrieve commitments."; setError(message); throw cause; } }, []);
  useEffect(() => { refresh().catch(() => {}); }, [refresh]);
  const attachEvidence = useCallback((evidence: Evidence[]) => { setAttached((current) => [...current, ...evidence]); setNotice(`Se fijaron ${evidence.length} evidencia(s) al mapa de decisión.`); }, []);
  const showGaps = useCallback((next: Gap[]) => { setGaps(next); setNotice(`Mostrando ${next.length} hueco(s) en el mapa de decisión.`); }, []);
  const openProposal = useCallback((next: Proposal) => { setProposal(next); setProposalId(undefined); setBusy(true); setError(""); setNotice("Preparando la propuesta para revisión. Todavía no se creó nada."); void api<{ proposal: { id: string } }>("", { operation: "prepare", proposal: next }).then(({ proposal: prepared }) => { setProposalId(prepared.id); setNotice("Revisá los compromisos exactos de abajo. Todavía no se creó nada."); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to prepare proposal.")).finally(() => setBusy(false)); }, []);
  const approve = useCallback(async () => { if (!proposal || !proposalId || busy) return status ?? { status: "unconfigured", message: "La propuesta todavía no está lista para aprobación." }; setBusy(true); try { const { commitments } = await api<{ commitments: Commitment[] }>("", { operation: "approve", proposalId }); const next: CommitmentsStatus = { status: "connected", workspaceId: "", identityName: "", commitments }; setProposal(undefined); setProposalId(undefined); setNotice("Compromisos guardados y releídos desde Ambiguous."); await refresh(); return next; } finally { setBusy(false); } }, [proposal, proposalId, busy, status, refresh]);
  const deny = useCallback(async () => { if (!proposalId || busy) { setProposal(undefined); return; } setBusy(true); try { await api("", { operation: "deny", proposalId }); setProposal(undefined); setProposalId(undefined); setNotice("Propuesta rechazada. No se creó ningún compromiso."); } finally { setBusy(false); } }, [proposalId, busy]);
  return { decision, gaps, proposal, status, busy, error, notice, attachEvidence, showGaps, openProposal, approve, deny, refresh };
}
