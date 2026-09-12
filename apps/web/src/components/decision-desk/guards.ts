/**
 * Guardas de P1: el agente solo puede senalar cosas que el equipo ve.
 *
 * Estan del lado del navegador a proposito. P2 produce `Gap[]` y `Evidence[]`
 * desde el contexto de la pagina, pero un modelo puede alucinar un id o una
 * URL; si eso llega a la matriz, la pagina muestra algo que no existe. Estas
 * funciones lo rechazan y devuelven el motivo para que el modelo corrija.
 */
import type { Decision, Evidence, Gap } from "./contract";

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
      problems.push(
        `la evidencia necesita una URL http(s) real, llego "${item.url}"`,
      );
    return problems;
  });
}

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
