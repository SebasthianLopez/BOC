/**
 * Caso oficial de demo y prueba, copiado de `PROYECTO.md` (sección "Caso
 * oficial de demo y prueba"). No se agrega ni un dato sobre los proveedores
 * que no esté en esa especificación.
 *
 * Las alternativas arrancan SIN evidencia a propósito: el hueco 1 dice que no
 * hay evidencia comparable de costo para ninguna alternativa, y el hueco 2 que
 * falta confirmar la cobertura local con una fuente real. Esas celdas vacías
 * son el estado inicial correcto, no un descuido.
 */
import type { Decision, Gap } from "./contract";

export const officialDecision: Decision = {
  id: "DEC-payments",
  title: "Pasarela de pagos para BOC Academy",
  context:
    "BOC Academy quiere vender un curso online a clientes de Paraguay y Brasil. Hay que elegir la pasarela de pagos antes del siguiente hito.",
  successCriteria:
    "Una pasarela elegida, con costo y cumplimiento validados con fuentes reales y los compromisos asignados antes del siguiente hito.",
  owner: "Valeria (producto)",
  participants: [
    "Valeria (producto)",
    "Diego (ingeniería)",
    "Sofía (operaciones/compliance)",
  ],
  status: "open",
  criteria: [
    {
      id: "cobertura",
      name: "Cobertura de métodos de pago en Paraguay y Brasil",
      weight: 3,
    },
    { id: "costo", name: "Costo total por transacción", weight: 3 },
    {
      id: "integracion",
      name: "Esfuerzo de integración y soporte técnico",
      weight: 2,
    },
    {
      id: "cumplimiento",
      name: "Requisitos de cumplimiento y operación",
      weight: 3,
    },
  ],
  alternatives: [
    {
      id: "alt-stripe",
      name: "Stripe",
      summary:
        "Integración conocida por el equipo, pero la cobertura de los mercados objetivo debe verificarse.",
      evidence: [],
    },
    {
      id: "alt-dlocal",
      name: "dLocal",
      summary:
        "Ofrece métodos de pago locales, pero faltan datos comparables de costo, soporte y cumplimiento.",
      evidence: [],
    },
  ],
  notes: [],
};

/**
 * Los tres huecos iniciales que el guion exige mostrar en el paso 2, antes de
 * que el agente diga nada. Son datos iniciales deliberados de `PROYECTO.md`,
 * no hechos inventados sobre los proveedores.
 */
export const initialGaps: Gap[] = [
  {
    kind: "evidence",
    criterionId: "costo",
    message:
      "No hay evidencia comparable de costo por transacción para ninguna alternativa.",
  },
  {
    kind: "evidence",
    criterionId: "cobertura",
    message:
      "Falta confirmar, con una fuente real, qué métodos locales cubre cada proveedor en Paraguay y Brasil.",
  },
  {
    kind: "owner",
    message:
      "Sofía aún no tiene asignado el compromiso de validar cumplimiento y el contrato.",
  },
];
