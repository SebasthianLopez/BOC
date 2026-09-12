"use client";

import type { CSSProperties } from "react";

import type { Alternative, Decision, Evidence } from "./contract";
import styles from "./decision-desk.module.css";

function EvidenceItems({ items }: { items: Evidence[] }) {
  return (
    <ul className={styles.evidenceList}>
      {items.map((item, index) => (
        <li key={item.id} style={{ "--i": index } as CSSProperties}>
          <a href={item.url} target="_blank" rel="noreferrer">
            {item.claim}
          </a>
          <span className={styles.source}>
            {item.source}
            <span className={styles.addedBy}>
              {item.addedBy === "agent" ? "agente" : "equipo"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function generalEvidence(alternative: Alternative) {
  return alternative.evidence.filter((item) => !item.criterionId);
}

/**
 * Alternativas x criterios. Una celda vacia es el punto del escritorio: es la
 * forma visible de un hueco, asi que dice que falta en vez de quedar en blanco.
 */
export function DecisionMatrix({ decision }: { decision: Decision }) {
  return (
    <section className={styles.section} aria-labelledby="matrix-title">
      <div className={styles.sectionHeader}>
        <h3 id="matrix-title">Alternativas &times; criterios</h3>
        <span className={styles.count}>
          {decision.alternatives.length} alternativas ·{" "}
          {decision.criteria.length} criterios
        </span>
      </div>
      <p className={styles.hint}>
        Cada celda guarda la evidencia de esa alternativa frente a ese criterio.
        Los enlaces vienen de una búsqueda real, nunca de la memoria del
        asistente.
      </p>

      <div className={styles.matrixWrap}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th scope="col">Alternativa</th>
              {decision.criteria.map((criterion) => (
                <th key={criterion.id} scope="col">
                  {criterion.name}
                  {criterion.weight ? (
                    <span className={styles.weight}>
                      peso {criterion.weight}
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {decision.alternatives.map((alternative) => {
              const general = generalEvidence(alternative);
              return (
                <tr key={alternative.id}>
                  <th scope="row" className={styles.altCell}>
                    <strong>{alternative.name}</strong>
                    <p>{alternative.summary}</p>
                    {general.length ? <EvidenceItems items={general} /> : null}
                  </th>
                  {decision.criteria.map((criterion) => {
                    const items = alternative.evidence.filter(
                      (item) => item.criterionId === criterion.id,
                    );
                    return (
                      <td
                        key={criterion.id}
                        className={
                          items.length
                            ? styles.cell
                            : `${styles.cell} ${styles.cellEmpty}`
                        }
                      >
                        {items.length ? (
                          <EvidenceItems items={items} />
                        ) : (
                          <span className={styles.missing}>Sin evidencia</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
