---
name: decision-desk-p2-agent
description: Build Decision Desk agent behavior for P2 only; use for facilitator prompts and typed gap, research, and proposal tools in agent-core.
---

# Decision Desk — P2 Agent

Read root `AGENTS.md` and `PROYECTO.md` before editing. The agent facilitates a
decision; it never decides for the team or writes Ambiguous tasks.

## Scope

Only edit `packages/agent-core/**`. Do not edit `apps/web/**`, dependencies,
credentials or `.env`.

## Contracts

Mirror the `Gap`, `Evidence` and `Proposal` shapes from `PROYECTO.md` with Zod
without importing app code. Use the existing search capability when integrating
Exa.

`research_alternative` returns only real Exa URLs and claims. Without Exa, it
states the limitation and returns no invented evidence. `detect_gaps` and
`propose_decision` prepare frontend UI only; they never expose raw write tools.

## Done

Use page context first, distinguish evidence from inference, request approval
with `Proposal`, and run `npm run typecheck` plus relevant checks. Report exact
files and P1/P3 dependencies.
