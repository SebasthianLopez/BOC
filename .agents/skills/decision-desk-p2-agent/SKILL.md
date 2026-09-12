---
name: decision-desk-p2-agent
description: Build Decision Desk agent behavior for P2 only; use for facilitator prompts and typed gap, research, and proposal tools in agent-core.
---

# Decision Desk — P2 Agent

Read root `AGENTS.md` and `PROYECTO.md` section 5 before editing. Read the applicable repository Exa skill before integrating Exa. The agent facilitates a decision; it never decides for the team or writes Ambiguous tasks.

## Scope

Only edit `packages/agent-core/**`. Do not edit `apps/web/**`, dependencies, credentials, or `.env`.

## Contracts

Mirror these shapes with Zod without importing app code: `Gap` is `{ kind: "evidence" | "owner" | "criteria", alternativeId?, criterionId?, message }`; `Evidence` is `{ id, alternativeId, criterionId?, claim, url, source, addedBy }`; `Proposal` is `{ decisionId, recommendation, rationale, commitments: [{ title, owner, dueDate }] }`.

`research_alternative` returns only real Exa URLs and claims. Without Exa, it states the limitation and returns no invented evidence. `detect_gaps` and `propose_decision` prepare frontend UI only; no raw write tools.

## Done

Use page context first, distinguish evidence from inference, request approval with `Proposal`, and run `npm run typecheck` plus relevant checks. Report exact files and P1/P3 dependencies.

## Demo lead

P2 is also the presenter and recorder of the official two-minute demo. This does not expand the source-code scope above. Once P4 confirms that integrated `main` is ready, read `DEMO_RUNBOOK.md` completely, rehearse its exact prompts, and record only verified live behavior. Do not expose credentials, improvise provider claims, approve a proposal with a past date, or claim that an external task exists without showing its ID in the app or its record in the Ambiguous test workspace.
