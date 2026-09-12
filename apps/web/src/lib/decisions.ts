export type Criterion = { id: string; name: string; weight?: 1 | 2 | 3 };
export type Evidence = {
  id: string;
  alternativeId: string;
  criterionId?: string;
  claim: string;
  url: string;
  source: string;
  addedBy: "agent" | "user";
};
export type Alternative = {
  id: string;
  name: string;
  summary: string;
  evidence: Evidence[];
};
export type Decision = {
  id: string;
  title: string;
  context: string;
  successCriteria?: string;
  owner?: string;
  participants: string[];
  criteria: Criterion[];
  alternatives: Alternative[];
  notes: string[];
  status: "open" | "decided";
};
export type Gap = {
  kind: "evidence" | "owner" | "criteria";
  alternativeId?: string;
  criterionId?: string;
  message: string;
};
export type Proposal = {
  decisionId: string;
  recommendation: string;
  rationale: string;
  commitments: { title: string; owner: string; dueDate: string }[];
};

export const initialDecision: Decision = {
  id: "boc-payment-gateway",
  title: "Pasarela de pagos para BOC Academy",
  context:
    "Elegir una pasarela para vender un curso online a clientes de Paraguay y Brasil.",
  successCriteria:
    "Cobertura local verificable, costo comparable, integración viable y cumplimiento operativo.",
  owner: "Valeria",
  participants: ["Valeria", "Diego", "Sofía"],
  criteria: [
    { id: "payment-methods", name: "Cobertura de métodos de pago en Paraguay y Brasil", weight: 3 },
    { id: "transaction-cost", name: "Costo total por transacción", weight: 3 },
    { id: "integration", name: "Esfuerzo de integración y soporte técnico", weight: 2 },
    { id: "compliance", name: "Requisitos de cumplimiento y operación", weight: 2 },
  ],
  alternatives: [
    { id: "stripe", name: "Stripe", summary: "Integración conocida por el equipo, pero debe verificarse la cobertura de los mercados objetivo.", evidence: [] },
    { id: "dlocal", name: "dLocal", summary: "Ofrece métodos de pago locales, pero faltan datos comparables de costo, soporte y cumplimiento.", evidence: [] },
  ],
  notes: [
    "No hay evidencia comparable de costo por transacción para ninguna alternativa.",
    "Falta confirmar con una fuente real los métodos locales cubiertos en Paraguay y Brasil.",
    "Sofía aún no tiene asignado el compromiso de validar cumplimiento y contrato.",
  ],
  status: "open",
};

export const initialGaps: Gap[] = [
  { kind: "evidence", criterionId: "transaction-cost", message: "No hay evidencia comparable de costo por transacción para ninguna alternativa." },
  { kind: "evidence", criterionId: "payment-methods", message: "Falta confirmar con una fuente real los métodos locales cubiertos en Paraguay y Brasil." },
  { kind: "owner", alternativeId: "dlocal", message: "Sofía aún no tiene asignado el compromiso de validar cumplimiento y contrato." },
];

export function findDecision(id: string): Decision {
  if (id !== initialDecision.id) throw new Error("Unknown decision.");
  return initialDecision;
}
