"use client";

import type { CSSProperties } from "react";

import type { Decision, Gap } from "./contract";
import styles from "./decision-desk.module.css";

const kindLabel: Record<Gap["kind"], string> = {
  evidence: "Evidencia",
  owner: "Responsable",
  criteria: "Criterio",
};

function where(decision: Decision, gap: Gap) {
  const alternative = decision.alternatives.find(
    (item) => item.id === gap.alternativeId,
  );
  const criterion = decision.criteria.find(
    (item) => item.id === gap.criterionId,
  );
  const parts = [alternative?.name, criterion?.name].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/**
 * `Gap[]` tal cual. La página no inventa huecos ni los deduce por su cuenta.
 *
 * Banana Cream con texto Midnight Violet (13.89:1), el mismo color que llevan
 * las celdas vacías de la matriz: lo pendiente se lee igual en los dos lados.
 */
export function GapsPanel({
  decision,
  gaps,
}: {
  decision: Decision;
  gaps: Gap[];
}) {
  return (
    <section className={styles.section} aria-labelledby="gaps-title">
      <div className={styles.sectionHeader}>
        <h3 id="gaps-title">Qué falta para poder decidir</h3>
        <span className={styles.count}>{gaps.length} abiertos</span>
      </div>
      {gaps.length ? (
        <ul className={styles.gapList}>
          {gaps.map((gap, index) => {
            const location = where(decision, gap);
            return (
              <li
                key={`${gap.kind}-${index}`}
                style={{ "--i": index } as CSSProperties}
              >
                <span className={styles.gapKind}>{kindLabel[gap.kind]}</span>
                <span>
                  {gap.message}
                  {location ? (
                    <span className={styles.gapWhere}>{location}</span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="ck-empty">
          No hay huecos abiertos. Preguntale al facilitador qué falta antes de
          tomar esta decisión.
        </p>
      )}
    </section>
  );
}
