---
name: decision-desk-p3-server
description: Build Decision Desk data, approval, Ambiguous persistence, and web API behavior for P3 only.
---

# Decision Desk — P3 Server

Read root `AGENTS.md` and `PROYECTO.md` section 5 before editing. Preserve the starter approval boundary: only the server writes to Ambiguous after an in-page approval from the same browser session.

## Scope

Only edit `apps/web/src/lib/**` and `apps/web/src/app/api/**`. Do not edit components, `app/page.tsx`, `packages/agent-core/**`, dependencies, or `.env`.

## Contracts

Decision data uses the exact section-5 types in `apps/web/src/lib/decisions.ts`. `Proposal` contains `decisionId`, `recommendation`, `rationale`, and `{ title, owner, dueDate }` commitments. Approval returns exactly `{ commitments: [{ title, owner, dueDate, ambiguousId, url }] }`. Read-back is keyed by `decisionId`; IDs/links originate only from Ambiguous.

Keep JSON/origin/session validation, workspace/identity binding, expiry, immutable server-held approval fields, and idempotency per commitment. Same approval cannot duplicate tasks, including after restart. Decline and reads create zero tasks; provider errors never leak secrets.

## Done

Approval creates and reads every displayed commitment; refresh returns it; decline creates none. Tests cover approval, decline, idempotency, read-back, and HTTP contract. Run `npm run typecheck` and `npm run test --workspace web`.
