"use client";

import type { CSSProperties } from "react";

import type { CommitmentsStatus, Proposal } from "./contract";
import styles from "./decision-desk.module.css";

/**
 * La compuerta de aprobación. Este control es lo único en la página que puede
 * provocar una escritura, y muestra cada compromiso textual antes. Estar de
 * acuerdo en el chat no autoriza nada.
 *
 * Se lee pendiente, nunca ejecutada: filo Sandy Brown, chip "pendiente" y el
 * texto de qué pasa al aprobar arriba de los botones.
 */
export function ProposalApproval({
  proposal,
  busy,
  error,
  onApprove,
  onDeny,
}: {
  proposal: Proposal;
  busy: boolean;
  /** Error del adaptador de P3. Si la propuesta no se pudo preparar, aprobar no puede funcionar. */
  error?: string;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <section className="ck-approval" aria-labelledby="proposal-title">
      <h3 id="proposal-title">
        Propuesta del facilitador
        <span className={styles.pendingBadge}>Pendiente de aprobación</span>
      </h3>

      <p className={styles.recommendation}>{proposal.recommendation}</p>
      <p className={styles.rationale}>{proposal.rationale}</p>

      <ul className={styles.commitmentList}>
        {proposal.commitments.map((commitment, index) => (
          <li
            key={`${commitment.title}-${index}`}
            style={{ "--i": index } as CSSProperties}
          >
            <strong>{commitment.title}</strong>
            <span className={styles.commitmentMeta}>
              <span>Responsable: {commitment.owner}</span>
              <span>Fecha: {commitment.dueDate}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="ck-local-note">
        Aprobar crea {proposal.commitments.length} compromiso(s) en Ambiguous,
        exactamente como están escritos arriba. Rechazar no crea nada.
      </p>

      {error ? (
        <p role="alert" className="ck-error">
          {error} Mientras tanto, aprobar no puede crear nada.
        </p>
      ) : null}

      <div className="ck-approval-actions">
        <button
          type="button"
          className="ck-btn ck-btn--primary"
          disabled={busy || !!error}
          onClick={onApprove}
        >
          {busy ? "Creando…" : "Aprobar y crear"}
        </button>
        <button
          type="button"
          className="ck-btn"
          disabled={busy}
          onClick={onDeny}
        >
          Rechazar
        </button>
      </div>
    </section>
  );
}

/**
 * Compromisos releídos desde Ambiguous. Los IDs y enlaces se muestran solo si
 * el proveedor los devolvió; el caso sin configurar lo dice sin rodeos.
 */
export function CommitmentsPanel({ status }: { status?: CommitmentsStatus }) {
  return (
    <section className={styles.section} aria-labelledby="commitments-title">
      <div className={styles.sectionHeader}>
        <h3 id="commitments-title">Compromisos creados</h3>
        <span className="ck-tag">Ambiguous</span>
      </div>

      {!status ? (
        <p className="ck-local-note">Consultando Ambiguous…</p>
      ) : status.status === "unconfigured" ? (
        <p className={styles.notConnected}>{status.message}</p>
      ) : status.commitments.length ? (
        <>
          <p className="ck-local-note">
            Releído desde Ambiguous como {status.identityName}. Espacio de
            trabajo <code>{status.workspaceId}</code>.
          </p>
          <ul className={styles.commitmentList}>
            {status.commitments.map((commitment, index) => (
              <li
                key={commitment.ambiguousId}
                style={{ "--i": index } as CSSProperties}
              >
                <strong>{commitment.title}</strong>
                <span className={styles.commitmentMeta}>
                  <span>Responsable: {commitment.owner}</span>
                  <span>Fecha: {commitment.dueDate}</span>
                  <code className="ck-record-id">{commitment.ambiguousId}</code>
                  {commitment.url ? (
                    <a
                      className={styles.commitmentLink}
                      href={commitment.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir en Ambiguous
                    </a>
                  ) : (
                    <span className="ck-muted">
                      Sin enlace: usá este ID en el espacio de trabajo.
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="ck-empty">
          Todavía no se creó ningún compromiso para esta decisión.
        </p>
      )}
    </section>
  );
}
