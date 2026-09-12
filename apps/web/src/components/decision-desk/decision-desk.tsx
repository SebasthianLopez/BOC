"use client";

import type { DecisionWorkplace } from "./contract";
import { DecisionMatrix } from "./decision-matrix";
import { GapsPanel } from "./gaps-panel";
import { CommitmentsPanel, ProposalApproval } from "./proposal-approval";
import styles from "./decision-desk.module.css";

/**
 * La decisión compartida que el equipo está mirando. Todo lo que el agente
 * razona está en este panel, y eso es lo que lo hace un escritorio de decisión
 * y no un chatbot.
 *
 * Orden deliberado, el del brief: qué se decide, qué se compara, qué falta,
 * qué propone el agente, qué requiere tu aprobación.
 */
export function DecisionDesk({ workplace }: { workplace: DecisionWorkplace }) {
  const { decision, gaps, proposal, status, busy, error, notice } = workplace;

  return (
    <section className="ck-panel" aria-labelledby="decision-title">
      {/* Título y contexto antes que cualquier metadato técnico. */}
      <h2 id="decision-title" className={styles.decisionTitle}>
        {decision.title}
      </h2>
      <p className={styles.decisionContext}>{decision.context}</p>

      <p className={styles.decisionMeta}>
        <span className={styles.statusOpen}>
          {decision.status === "open" ? "Abierta" : "Decidida"}
        </span>
        <span>{decision.participants.join(" · ")}</span>
        <code>{decision.id}</code>
      </p>

      <details className="ck-more">
        <summary>Responsable, criterio de éxito y notas</summary>
        <dl className="ck-detail-facts">
          <div>
            <dt>Responsable</dt>
            <dd>{decision.owner ?? "Sin asignar"}</dd>
          </div>
          <div>
            <dt>Participantes</dt>
            <dd>{decision.participants.join(", ")}</dd>
          </div>
          <div>
            <dt>Criterio de éxito</dt>
            <dd>{decision.successCriteria ?? "Sin escribir"}</dd>
          </div>
        </dl>
        {decision.notes.length ? (
          <>
            <h3>Notas</h3>
            <ul className={styles.notes}>
              {decision.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </>
        ) : null}
      </details>

      <DecisionMatrix decision={decision} />
      <GapsPanel decision={decision} gaps={gaps} />

      {proposal ? (
        <div className={`${styles.section} ${styles.approvalEnter}`}>
          <ProposalApproval
            proposal={proposal}
            busy={busy}
            error={error}
            onApprove={() => void workplace.approve()}
            onDeny={() => void workplace.deny()}
          />
        </div>
      ) : null}

      <CommitmentsPanel status={status} />

      {error && !proposal ? (
        <p role="alert" className="ck-error">
          {error}
        </p>
      ) : null}
      <p role="status" className="ck-notice">
        {notice}
      </p>
    </section>
  );
}
