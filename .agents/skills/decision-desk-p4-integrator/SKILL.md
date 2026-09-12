---
name: decision-desk-p4-integrator
description: Coordinate and integrate the Decision Desk hackathon project for P4; use for repository setup, PR sequencing, demo evidence, and delivery readiness.
---

# Decision Desk — P4 Integrator

Read `PROYECTO.md`, `AGENTS.md`, `hackathon-rules.md` and `SUBMISSION.md`
before acting. P4 owns the product story and integration, not broad unreviewed
source changes.

## Scope

Only edit delivery material such as `README.md`, `SUBMISSION.md` and explicitly
assigned demo files. Give sample-decision content to P3; P3 alone edits
`apps/web/src/lib/decisions.ts`. Do not edit P1/P2/P3 source unless ownership is
reassigned.

## Git workflow

`main` remains runnable. P1, P2, P3 and P4 work from separate role branches.
Merge P3 contracts first, then P2 agent behavior, then P1 UI. Require every PR
to state files changed, verification run and anything not live-tested. Never
force-push `main`, commit `.env`, expose keys or claim an action without its
returned ID/link.

## Done

The demo proves decision → gaps → evidence or honest Exa limitation → proposal
→ approve → Ambiguous read-back after refresh → decline with zero writes.
Documentation distinguishes starter code from hackathon work, and
`npm run verify` is green on the integrated branch before recording.
