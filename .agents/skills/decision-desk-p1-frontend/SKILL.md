---
name: decision-desk-p1-frontend
description: Build the Decision Desk web interface for P1 only; use for page context, decision-map components, evidence, gaps, and approval UI.
---

# Decision Desk — P1 Frontend

Read root `AGENTS.md` and `PROYECTO.md` before editing. This is a Decision
Desk, not a generic chat: alternatives, criteria, evidence, gaps, proposal and
commitments must be visible in the page.

## Scope

Only edit `apps/web/src/app/page.tsx` and `apps/web/src/components/**`. Do not
edit `apps/web/src/lib/**`, `apps/web/src/app/api/**`,
`packages/agent-core/**`, dependencies or `.env`.

## Contracts

Use the exact `Decision`, `Criterion`, `Alternative`, `Evidence`, `Gap` and
`Proposal` shapes from `PROYECTO.md`. P3's approved response is exactly:

```ts
{ commitments: [{ title, owner, dueDate, ambiguousId, url }] }
```

Register page context and frontend tools that present `Gap[]`, `Evidence[]` and
`Proposal`. Chat text never authorizes a write; the approval control calls P3's
server adapter.

## Done

Show alternatives × criteria, evidence and gaps; render all commitments before
Approve/Decline; show returned IDs/links after approval; state that Decline
created nothing. Do not invent evidence, links or IDs. Run relevant web checks
and report files changed.
