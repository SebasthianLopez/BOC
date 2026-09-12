---
name: decision-desk-p1-frontend
description: Build the Decision Desk web interface for P1 only; use for page context, decision-map components, evidence, gaps, and approval UI.
---

# Decision Desk — P1 Frontend

Read root `AGENTS.md` and `PROYECTO.md` section 5 before editing. This is a Decision Desk, not a generic chat: alternatives, criteria, evidence, gaps, proposal, and commitments must be visible in the page.

Also read `FRONTEND_STYLE.md` and `.agents/skills/taste-skill/SKILL.md` before visual work. Taste is an audit reference, not the product specification. Its own scope excludes dashboards, so apply only its redesign, hierarchy, typography, color, interaction-state, responsive, and accessibility guidance. `FRONTEND_STYLE.md` overrides Taste for this product.

## Scope

Only edit `apps/web/src/app/page.tsx` and `apps/web/src/components/**`. Do not edit `apps/web/src/lib/**`, `apps/web/src/app/api/**`, `packages/agent-core/**`, dependencies, or `.env`.

## Contracts

Use `Decision`, `Criterion`, `Alternative`, `Evidence`, `Gap`, and `Proposal` from `apps/web/src/lib/decisions.ts`. Use `useDecisionWorkplace` from `apps/web/src/lib/use-decision-workplace.ts`. Approval returns `{ commitments: [{ title, owner, dueDate, ambiguousId, url: string | null }] }`.

Register context and frontend tools that present `Gap[]`, `Evidence[]`, and a `Proposal`. The approval control calls the P3 adapter. Text in chat never authorizes a write.

## Visual contract

Reading this as: a redesign of a B2B decision workspace for a small team, with a warm, confident, evidence-first language, implemented with the existing CSS and components.

Use `DESIGN_VARIANCE: 4`, `MOTION_INTENSITY: 2`, and `VISUAL_DENSITY: 7`.

Use this exact palette through semantic CSS variables:

- `#FFFDED` Ivory: canvas and primary surface.
- `#201335` Midnight Violet: text and strongest contrast.
- `#4F4789` Dusty Grape: primary actions, focus, selected state.
- `#FCE762` Banana Cream: gaps, pending attention, warning surfaces.
- `#FFB17A` Sandy Brown: evidence and proposal emphasis.

Never use white text on Banana Cream or Sandy Brown. Prefer Midnight Violet on both. Ivory on Dusty Grape is valid for primary buttons. Use one consistent radius system and restrained shadows. Do not add a design-system package, font, icon library, animation dependency, hero, decorative image, glassmorphism, gradient, or landing-page section. Preserve every tool name, data contract, approval boundary, test hook, and visible state.

## Done

Show alternatives × criteria, evidence and gaps; render every commitment before Approve/Decline; always display returned IDs and render record links only when `url` is non-null; state plainly that decline created nothing. Do not invent evidence, links, or IDs. Follow the acceptance checklist in `FRONTEND_STYLE.md`. Run relevant web checks and report files changed.
