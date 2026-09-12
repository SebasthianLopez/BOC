import React from "react";

/**
 * Chat-side card the agent can draw to summarise where a decision stands.
 *
 * Tool arguments arrive incrementally, before schema defaults are applied, so
 * every prop is optional and every branch has a streaming placeholder. Uses the
 * shared `ck-*` classes only, which keeps it renderable in a plain node test.
 */
export interface DecisionBriefProps {
  decision?: string;
  standing?: string;
  blocking?: Array<string | null> | null;
  nextSteps?: Array<string | null> | null;
  readiness?: string;
}

const readinessColor = {
  blocked: "var(--accent)",
  ready: "#2e7d5b",
  forming: "var(--muted)",
} as const;

function isReadiness(value?: string): value is keyof typeof readinessColor {
  return value === "blocked" || value === "ready" || value === "forming";
}

export function DecisionBrief({
  decision,
  standing,
  blocking,
  nextSteps,
  readiness,
}: DecisionBriefProps) {
  const color = isReadiness(readiness)
    ? readinessColor[readiness]
    : readinessColor.forming;
  return (
    <article className="ck-card" style={{ borderLeftColor: color }}>
      <h3>{decision || "Leyendo la decisión…"}</h3>
      <p>{standing || "Viendo cómo viene esta decisión…"}</p>
      {!!blocking?.length && (
        <dl className="ck-facts">
          {blocking.map((item, index) => (
            <div key={index}>
              <dt>Traba</dt>
              <dd>{item || "Cargando…"}</dd>
            </div>
          ))}
        </dl>
      )}
      {!!nextSteps?.length && (
        <ul className="ck-steps">
          {nextSteps.map((step, index) => (
            <li key={index}>{step || "Cargando…"}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
