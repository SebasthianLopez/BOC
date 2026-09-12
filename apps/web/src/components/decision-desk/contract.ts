/**
 * TEMPORARY CONTRACT MIRROR — owned by P1, deleted at integration.
 *
 * `PROYECTO.md` section 5 places these types in `apps/web/src/lib/decisions.ts`
 * and the page hook in `apps/web/src/lib/use-decision-workplace.ts`. Both are
 * P3's lane and are not on `main` yet, so P1 cannot import them and cannot
 * create them either. This file mirrors section 5 exactly so the desk
 * typechecks and runs today.
 *
 * INTEGRATION (P4): once P3 lands, replace the body of this file with
 *   export type * from "@/lib/decisions";
 * and swap `useDecisionDesk` for `useDecisionWorkplace` in `app/page.tsx`.
 * Nothing else in `components/decision-desk/**` should need to change.
 */

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

export type Gap = {
  kind: "evidence" | "owner" | "criteria";
  alternativeId?: string;
  criterionId?: string;
  message: string;
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

/** A commitment as proposed by the agent: no provider identity yet. */
export type Commitment = { title: string; owner: string; dueDate: string };

export type Proposal = {
  decisionId: string;
  recommendation: string;
  rationale: string;
  commitments: Commitment[];
};

/**
 * What approval returns, per PROYECTO.md section 5:
 * `{ commitments: [{ title, owner, dueDate, ambiguousId, url }] }`.
 * `ambiguousId` and `url` originate only from Ambiguous — never from this app.
 */
export type SavedCommitment = Commitment & {
  ambiguousId: string;
  url: string | null;
};

export type CommitmentsStatus =
  | { status: "unconfigured"; message: string }
  | {
      status: "connected";
      workspaceId: string;
      identityName: string;
      commitments: SavedCommitment[];
    };

/**
 * The page-facing surface P1 consumes. P3's `useDecisionWorkplace` should return
 * this shape so integration is a one-line import swap.
 *
 * PROYECTO.md puts "multiples decisiones" outside the MVP, so there is exactly
 * one decision and no picker.
 */
export type DecisionWorkplace = {
  /** The decision on screen, with any evidence attached this session. */
  decision: Decision;
  /** Gaps the agent reported for the selected decision. */
  gaps: Gap[];
  /** A proposal waiting for the in-page approval control, if any. */
  proposal?: Proposal;
  /** Ambiguous connection state plus commitments read back for this decision. */
  status?: CommitmentsStatus;
  busy: boolean;
  error: string;
  notice: string;
  /** Pin agent-researched evidence onto the visible alternative. */
  attachEvidence(evidence: Evidence[]): void;
  /** Show the gaps the agent detected. */
  showGaps(gaps: Gap[]): void;
  /** Stage a proposal for approval. Never writes. */
  openProposal(proposal: Proposal): void;
  /** The only path that may create tasks. */
  approve(): Promise<CommitmentsStatus>;
  /** Discards the proposal. Creates nothing. */
  deny(): Promise<void>;
  /** Re-read commitments from Ambiguous. */
  refresh(): Promise<CommitmentsStatus>;
};
