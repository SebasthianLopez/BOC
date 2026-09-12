import { Exa } from "exa-js";
import {
  type Decision,
  type Evidence,
  type Gap,
  type Proposal,
  EXA_UNAVAILABLE_MESSAGE,
  researchAlternativeParameters,
  type ResearchAlternativeArgs,
} from "./schemas";

/** A relative deadline is safe for the official demo and never becomes stale. */
export const OFFICIAL_DUE_DATE = "Antes del siguiente hito";

const SEARCH_TYPE = (process.env.EXA_SEARCH_TYPE ?? "fast") as
  "instant" | "fast" | "auto" | "deep-lite" | "deep" | "deep-reasoning";

const COST_TERMS = ["costo", "cost", "precio", "pricing", "tarifa", "fee", "comisi"];
const COVERAGE_TERMS = ["cobertura", "cobertura", "método", "metodo", "payment", "pago", "local", "paraguay", "brasil", "brazil"];
const COVERAGE_QUERY_TERMS = ["cobertura", "método", "metodo", "payment method", "medios de pago", "formas de pago"];

export function isExaConfigured(): boolean {
  return Boolean(process.env.EXA_API_KEY);
}

function includesAny(text: string, terms: string[]) {
  const normalized = text.toLocaleLowerCase("es");
  return terms.some((term) => normalized.includes(term));
}

function criterion(decision: Decision, terms: string[]) {
  return decision.criteria.find((item) => includesAny(item.name, terms));
}

function hasEvidenceFor(alternative: Decision["alternatives"][number], criterionId: string | undefined, terms: string[]) {
  return alternative.evidence.some((evidence) =>
    (!criterionId || evidence.criterionId === criterionId) &&
    includesAny(`${evidence.claim} ${evidence.source}`, terms),
  );
}

function validateFocusedResearchQuery(criterionId: string, query: string) {
  if (criterionId === "payment-methods" && includesAny(query, COST_TERMS)) {
    throw new Error("Research payment-methods separately from transaction-cost; do not mix pricing terms into this query.");
  }
  if (criterionId === "transaction-cost" && includesAny(query, COVERAGE_QUERY_TERMS)) {
    throw new Error("Research transaction-cost separately from payment-methods; do not mix coverage terms into this query.");
  }
}

function matchesCriterion(criterionId: string, title: string, claim: string) {
  const text = `${title} ${claim}`;
  if (criterionId === "payment-methods") {
    return includesAny(text, COVERAGE_TERMS) && !includesAny(text, COST_TERMS);
  }
  if (criterionId === "transaction-cost") {
    return includesAny(text, COST_TERMS);
  }
  return true;
}

/**
 * Examines only the decision page context. It does not search, decide, or write.
 */
export function detectGaps(decision: Decision): Gap[] {
  const gaps: Gap[] = [];
  const costCriterion = criterion(decision, ["costo", "cost", "transacci"]);
  const coverageCriterion = criterion(decision, ["cobertura", "método", "metodo", "payment"]);

  if (costCriterion && decision.alternatives.some((alternative) =>
    !hasEvidenceFor(alternative, costCriterion.id, ["costo", "cost", "precio", "tarifa", "fee"]),
  )) {
    gaps.push({
      kind: "evidence",
      criterionId: costCriterion.id,
      message: "No hay evidencia comparable de costo por transacción para ninguna alternativa.",
    });
  }

  if (coverageCriterion && decision.alternatives.some((alternative) =>
    !hasEvidenceFor(alternative, coverageCriterion.id, ["paraguay", "brasil", "brazil", "método", "metodo", "local"]),
  )) {
    gaps.push({
      kind: "evidence",
      criterionId: coverageCriterion.id,
      message: "Falta confirmar, con una fuente real, qué métodos locales cubre cada proveedor en Paraguay y Brasil.",
    });
  }

  const sofiaAssigned = decision.notes.some((note) =>
    includesAny(note, ["sofía", "sofia"]) && includesAny(note, ["cumplimiento", "compliance", "contrato", "validar"]),
  );
  if (decision.participants.some((participant) => includesAny(participant, ["sofía", "sofia"])) && !sofiaAssigned) {
    gaps.push({
      kind: "owner",
      message: "Sofía aún no tiene asignado el compromiso de validar cumplimiento y el contrato.",
    });
  }

  return gaps;
}

/**
 * Runs only after the calling surface has received an explicit user request.
 * With no key it returns the exact Evidence[] contract, empty rather than fake.
 */
export async function researchAlternative(input: ResearchAlternativeArgs): Promise<Evidence[]> {
  const { decision, alternativeId, query, criterionId, results } = researchAlternativeParameters.parse(input);
  const alternative = decision.alternatives.find((item) => item.id === alternativeId);
  if (!alternative) throw new Error("The requested alternative is not present in the decision context.");
  validateFocusedResearchQuery(criterionId, query);

  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return [];

  const exa = new Exa(apiKey);
  const response = await exa.searchAndContents(query, {
    type: SEARCH_TYPE,
    numResults: results,
    highlights: { numSentences: 2, highlightsPerUrl: 1 },
  });

  return response.results.flatMap((hit) => {
    // Do not synthesize identifiers, URLs, or claims: every returned field is Exa data.
    if (!hit.id || !hit.url || !hit.title) return [];
    const claim = hit.highlights?.[0];
    if (!claim || !matchesCriterion(criterionId, hit.title, claim)) return [];
    return [{
      id: hit.id,
      alternativeId: alternative.id,
      criterionId,
      claim,
      url: hit.url,
      source: hit.title,
      addedBy: "agent" as const,
    }];
  });
}

/** Prepares a reviewable, provisional recommendation. It never creates tasks. */
export function proposeDecision(decision: Decision): Proposal {
  const dlocal = decision.alternatives.find((alternative) =>
    alternative.name.trim().toLocaleLowerCase("es") === "dlocal",
  );
  const target = dlocal?.name ?? "la alternativa que el equipo priorice para validación";

  return {
    decisionId: decision.id,
    recommendation: `Propuesta provisional: enviar ${target} a una prueba técnica. Esto no decide la pasarela final; requiere aprobación del equipo.`,
    rationale: "La cobertura local puede justificar una validación técnica, pero el costo total y los requisitos de compliance siguen pendientes de evidencia comparable.",
    commitments: [
      {
        title: `Crear una prueba de integración/sandbox con ${target}`,
        owner: "Diego",
        dueDate: OFFICIAL_DUE_DATE,
      },
      {
        title: "Solicitar cotización y validar requisitos de compliance",
        owner: "Sofía",
        dueDate: OFFICIAL_DUE_DATE,
      },
    ],
  };
}
