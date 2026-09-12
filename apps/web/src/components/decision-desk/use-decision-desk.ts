"use client";

/**
 * STAND-IN PARA P3 — lo mantiene P1 y se borra al integrar.
 *
 * `PROYECTO.md` ubica este hook en `apps/web/src/lib/use-decision-workplace.ts`,
 * que es carril de P3 y todavía no está en `main`. Este stand-in devuelve
 * exactamente la forma `DecisionWorkplace`, así que integrar es cambiar un
 * import en `app/page.tsx`.
 *
 * No inventa endpoints ni IDs de Ambiguous: en esta rama no hay adaptador de
 * aprobación, así que `approve` y `refresh` informan la limitación en lugar de
 * afirmar que crearon una tarea.
 */
import { useCallback, useMemo, useState } from "react";
import type {
  CommitmentsStatus,
  Decision,
  DecisionWorkplace,
  Evidence,
  Gap,
  Proposal,
} from "./contract";
import { initialGaps, officialDecision } from "./official-case";

const sinAdaptador =
  "El adaptador de aprobación no está conectado en esta rama, así que no se creó ninguna tarea en Ambiguous. Los IDs y enlaces reales aparecen cuando se integre el carril del servidor y se configure AMBIGUOUS_API_KEY.";

const noConfigurado: CommitmentsStatus = {
  status: "unconfigured",
  message: sinAdaptador,
};

/** Une la evidencia de la sesión a la decisión para que la matriz muestre una sola foto. */
export function withEvidence(decision: Decision, added: Evidence[]): Decision {
  if (!added.length) return decision;
  return {
    ...decision,
    alternatives: decision.alternatives.map((alternative) => {
      const extra = added.filter(
        (item) =>
          item.alternativeId === alternative.id &&
          !alternative.evidence.some((existing) => existing.id === item.id),
      );
      return extra.length
        ? { ...alternative, evidence: [...alternative.evidence, ...extra] }
        : alternative;
    }),
  };
}

/** El agente solo puede fijar evidencia a una alternativa que esté en pantalla. */
export function rejectUnknownEvidence(
  decision: Decision,
  evidence: Evidence[],
): string[] {
  const alternatives = new Set(decision.alternatives.map((item) => item.id));
  const criteria = new Set(decision.criteria.map((item) => item.id));
  return evidence.flatMap((item) => {
    const problems: string[] = [];
    if (!alternatives.has(item.alternativeId))
      problems.push(`alternativeId desconocido "${item.alternativeId}"`);
    if (item.criterionId && !criteria.has(item.criterionId))
      problems.push(`criterionId desconocido "${item.criterionId}"`);
    if (!/^https?:\/\//i.test(item.url))
      problems.push(`la evidencia necesita una URL http(s) real, llegó "${item.url}"`);
    return problems;
  });
}

/** Misma guarda para los huecos: un hueco debe apuntar a algo que el equipo ve. */
export function rejectUnknownGaps(decision: Decision, gaps: Gap[]): string[] {
  const alternatives = new Set(decision.alternatives.map((item) => item.id));
  const criteria = new Set(decision.criteria.map((item) => item.id));
  return gaps.flatMap((gap) => {
    const problems: string[] = [];
    if (gap.alternativeId && !alternatives.has(gap.alternativeId))
      problems.push(`alternativeId desconocido "${gap.alternativeId}"`);
    if (gap.criterionId && !criteria.has(gap.criterionId))
      problems.push(`criterionId desconocido "${gap.criterionId}"`);
    return problems;
  });
}

export function useDecisionDesk(): DecisionWorkplace {
  const [attached, setAttached] = useState<Evidence[]>([]);
  // Los tres huecos iniciales del guion ya están visibles al abrir la página.
  const [gaps, setGaps] = useState<Gap[]>(initialGaps);
  const [proposal, setProposal] = useState<Proposal>();
  const [status, setStatus] = useState<CommitmentsStatus>(noConfigurado);
  const [busy, setBusy] = useState(false);
  const [error] = useState("");
  const [notice, setNotice] = useState("");

  const decision = useMemo(
    () => withEvidence(officialDecision, attached),
    [attached],
  );

  const attachEvidence = useCallback((evidence: Evidence[]) => {
    setAttached((current) => [...current, ...evidence]);
    setNotice(`Se fijaron ${evidence.length} evidencia(s) al mapa de decisión.`);
  }, []);

  const showGaps = useCallback((next: Gap[]) => {
    setGaps(next);
    setNotice(`Mostrando ${next.length} hueco(s) en el mapa de decisión.`);
  }, []);

  const openProposal = useCallback((next: Proposal) => {
    setProposal(next);
    setNotice("Revisá los compromisos exactos de abajo. Todavía no se creó nada.");
  }, []);

  const refresh = useCallback(async () => {
    setStatus(noConfigurado);
    return noConfigurado;
  }, []);

  const approve = useCallback(async () => {
    if (!proposal || busy) return status;
    setBusy(true);
    try {
      // El único camino que puede crear tareas. Acá no hay adaptador, así que
      // informa la limitación en vez de afirmar una escritura.
      setStatus(noConfigurado);
      setNotice(`Aprobaste la propuesta, pero no se creó nada. ${sinAdaptador}`);
      return noConfigurado;
    } finally {
      setBusy(false);
    }
  }, [proposal, busy, status]);

  const deny = useCallback(async () => {
    if (!proposal || busy) return;
    setProposal(undefined);
    setNotice("Propuesta rechazada. No se creó ningún compromiso.");
  }, [proposal, busy]);

  return {
    decision,
    gaps,
    proposal,
    status,
    busy,
    error,
    notice,
    attachEvidence,
    showGaps,
    openProposal,
    approve,
    deny,
    refresh,
  };
}
