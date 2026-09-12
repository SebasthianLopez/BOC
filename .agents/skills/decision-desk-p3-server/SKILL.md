---
name: decision-desk-p3-server
description: Build Decision Desk data, approval, Ambiguous persistence, and web API behavior for P3 only.
---

# Decision Desk — P3 Server

Read root `AGENTS.md` and `PROYECTO.md` before editing. Preserve the starter
approval boundary: only the server writes to Ambiguous after an in-page approval
from the same browser session.

## Scope

Only edit `apps/web/src/lib/**` and `apps/web/src/app/api/**`. Do not edit
components, `app/page.tsx`, `packages/agent-core/**`, dependencies or `.env`.

## Contracts

Decision data uses the exact types in `PROYECTO.md`. `Proposal` contains
`decisionId`, `recommendation`, `rationale` and `{ title, owner, dueDate }`
commitments. Approval returns exactly:

```ts
{ commitments: [{ title, owner, dueDate, ambiguousId, url }] }
```

Read-back is keyed by `decisionId`; IDs and links originate only from
Ambiguous. Keep validation, session/origin checks, immutable server-held
approval fields and idempotency per commitment. Decline and reads create zero
tasks; provider errors never leak secrets.

## Done

Approval creates and reads every displayed commitment; refresh returns it;
decline creates none. Tests cover approval, decline, idempotency, read-back and
HTTP contract. Run `npm run typecheck` and `npm run test --workspace web`.
