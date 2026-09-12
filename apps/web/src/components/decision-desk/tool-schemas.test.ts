import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { initialDecision } from "@/lib/decisions";
import {
  attachEvidenceParameters,
  openProposalParameters,
  refreshCommitmentsParameters,
  showGapsParameters,
  toolDescriptions,
} from "./tool-schemas";

/**
 * Un schema que no serializa a JSON Schema rompe el tool-calling recien en
 * runtime, con el modelo ya corriendo. Estos tests lo atrapan antes.
 */
const tools = {
  show_gaps: showGapsParameters,
  attach_evidence: attachEvidenceParameters,
  open_proposal: openProposalParameters,
  refresh_commitments: refreshCommitmentsParameters,
};

test("cada herramienta serializa a JSON Schema de objeto cerrado", () => {
  for (const [name, schema] of Object.entries(tools)) {
    const json = z.toJSONSchema(schema) as Record<string, unknown>;
    assert.equal(json.type, "object", `${name} deberia ser un objeto`);
    assert.equal(
      json.additionalProperties,
      false,
      `${name} deberia cerrar propiedades extra`,
    );
  }
});

test("los campos opcionales no quedan como requeridos", () => {
  const json = z.toJSONSchema(attachEvidenceParameters) as any;
  const item = json.properties.evidence.items;
  assert.deepEqual(item.required, [
    "id",
    "alternativeId",
    "claim",
    "url",
    "source",
    "addedBy",
  ]);
  assert.ok(!item.required.includes("criterionId"));
  // La URL viaja como formato, que es lo que hace que el modelo mande una real.
  assert.equal(item.properties.url.format, "uri");
});

test("show_gaps acepta un hueco del caso oficial y rechaza uno vacio", () => {
  const criterion = initialDecision.criteria[0].id;
  assert.ok(
    showGapsParameters.safeParse({
      gaps: [{ kind: "evidence", criterionId: criterion, message: "Falta." }],
    }).success,
  );
  assert.ok(
    !showGapsParameters.safeParse({
      gaps: [{ kind: "evidence", criterionId: criterion, message: "" }],
    }).success,
  );
  assert.ok(
    !showGapsParameters.safeParse({ gaps: [{ kind: "otra", message: "x" }] })
      .success,
  );
});

test("attach_evidence exige una URL real y al menos un item", () => {
  const alternativeId = initialDecision.alternatives[0].id;
  const base = {
    id: "ev-1",
    alternativeId,
    claim: "Pagina de precios.",
    source: "ejemplo.com",
    addedBy: "agent" as const,
  };
  assert.ok(
    attachEvidenceParameters.safeParse({
      evidence: [{ ...base, url: "https://ejemplo.com/precios" }],
    }).success,
  );
  assert.ok(
    !attachEvidenceParameters.safeParse({
      evidence: [{ ...base, url: "segun recuerdo" }],
    }).success,
  );
  assert.ok(!attachEvidenceParameters.safeParse({ evidence: [] }).success);
});

test("open_proposal exige al menos un compromiso completo", () => {
  const valida = {
    decisionId: initialDecision.id,
    recommendation: "Mandar dLocal a prueba tecnica.",
    rationale: "Falta costo y compliance, pero la cobertura local decide.",
    commitments: [
      { title: "Prueba sandbox", owner: "Diego", dueDate: "2026-09-19" },
    ],
  };
  assert.ok(openProposalParameters.safeParse(valida).success);
  assert.ok(
    !openProposalParameters.safeParse({ ...valida, commitments: [] }).success,
  );
  // Un compromiso sin responsable no puede entrar: es justo lo que la pagina promete mostrar.
  assert.ok(
    !openProposalParameters.safeParse({
      ...valida,
      commitments: [{ title: "Algo", owner: "", dueDate: "2026-09-19" }],
    }).success,
  );
});

test("las descripciones le dicen al modelo que no puede escribir", () => {
  assert.match(toolDescriptions.open_proposal, /does NOT create anything/);
  assert.match(toolDescriptions.open_proposal, /approval in chat does not count/);
  assert.match(toolDescriptions.attach_evidence, /real URL/);
  assert.match(toolDescriptions.refresh_commitments, /Read-only/);
});
