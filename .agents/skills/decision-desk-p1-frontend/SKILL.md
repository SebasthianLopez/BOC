---
name: decision-desk-p1-frontend
description: Build the Decision Desk web interface for P1 only; use for page context, decision-map components, evidence, gaps, and approval UI.
---

# Decision Desk — P1 Frontend

Read root `AGENTS.md` and `PROYECTO.md` section 5 before editing. This is a Decision Desk, not a generic chat: alternatives, criteria, evidence, gaps, proposal, and commitments must be visible in the page.

## Scope

Only edit `apps/web/src/app/page.tsx` and `apps/web/src/components/**`. Do not edit `apps/web/src/lib/**`, `apps/web/src/app/api/**`, `packages/agent-core/**`, dependencies, or `.env`.

## Contracts

Use `Decision`, `Criterion`, `Alternative`, `Evidence`, `Gap`, and `Proposal` from `apps/web/src/lib/decisions.ts`. Use `useDecisionWorkplace` from `apps/web/src/lib/use-decision-workplace.ts`. Approval returns `{ commitments: [{ title, owner, dueDate, ambiguousId, url }] }`.

Register context and frontend tools that present `Gap[]`, `Evidence[]`, and a `Proposal`. The approval control calls the P3 adapter. Text in chat never authorizes a write.

## Done

Show alternatives × criteria, evidence and gaps; render every commitment before Approve/Decline; display returned IDs/links after approval; state plainly that decline created nothing. Do not invent evidence, links, or IDs. Run relevant web checks and report files changed.
