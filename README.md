# Decision Desk

> A contextual AI facilitator that turns a blocked team decision into sourced
> evidence, a reviewable proposal, and accountable follow-up work.

Decision Desk is the **Breakfast of Champions (BOC)** project for *Agents,
Everywhere: Bots, Channels & More*. Instead of acting as a standalone chatbot,
the agent works inside the decision page the team is already using.

The official demo helps BOC Academy compare **Stripe and dLocal** for selling an
online course in Paraguay and Brazil. The page holds the alternatives,
evaluation criteria, participants, evidence, and unresolved gaps. The agent can
research and propose actions, but only an explicit human approval can create
tasks in Ambiguous.

[Watch the Decision Desk walkthrough](assets/demos/decision-desk-walkthrough.mp4).

## How it works

```text
decision visible on the page
  -> agent identifies missing evidence and ownership
  -> user requests research
  -> Exa returns inspectable sources
  -> agent prepares a provisional proposal
  -> user rejects or approves
  -> approved commitments persist in Ambiguous
```

- Rejecting a proposal creates no task.
- Approving the same proposal again must not create duplicates.
- Sources, provider IDs, and record links are never invented.
- Missing integrations are reported instead of being simulated.

## Run it on a new computer

You do not need a GitHub account or an SSH key to clone this public repository.
GitHub authentication is only required if you intend to push changes.

### 1. Install the prerequisites

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) 22 or newer, including npm
- A current web browser

Verify the installation:

```powershell
git --version
node --version
npm --version
```

### 2. Clone and install

```powershell
git clone https://github.com/SebasthianLopez/BOC.git
cd BOC
npm ci
```

If the repository is already present:

```powershell
git switch main
git pull --ff-only origin main
npm ci
```

### 3. Configure the API access

If the root `.env` file is missing, create it from the template:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

If this hackathon checkout already contains a test `.env`, do not overwrite
it. Never commit personal credentials or show them in screenshots or videos.

The conversation requires a **model API key**. A ChatGPT subscription is not an
API credential. Choose one provider:

**OpenRouter**

```dotenv
MODEL_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-key
MODEL=openai/gpt-5.6-sol
```

Create a key at [OpenRouter](https://openrouter.ai/keys) and choose a model with
tool-calling support. An OpenAI key is not required when OpenRouter is selected.

**OpenAI API**

```dotenv
MODEL_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
MODEL=gpt-5.6-sol
```

Create the key in the [OpenAI API platform](https://platform.openai.com/api-keys)
and select a model available to that API project.

Add Exa for live web research:

```dotenv
EXA_API_KEY=your-exa-key
EXA_SEARCH_TYPE=fast
```

Create the key in the [Exa dashboard](https://dashboard.exa.ai/api-keys).
Without it, the interface still loads but the agent adds no research evidence.

Add Ambiguous for approved, persistent commitments:

```dotenv
AMBIGUOUS_API_KEY=your-workspace-key
```

In [Ambiguous AI](https://www.ambiguous.ai/), use the **Connect** instructions
for a test workspace you are allowed to modify. Without this key, research and
proposals still work, but task approval remains unavailable.

| Configuration | Available behavior |
| --- | --- |
| Model key | Contextual conversation, gap analysis, and proposals |
| Model + Exa | Live research with clickable sources |
| Model + Exa + Ambiguous | Complete workflow with persistent commitments |

### 4. Start the application

```powershell
npm run dev:web
```

Open [http://127.0.0.1:3100](http://127.0.0.1:3100). Keep the terminal running
and stop it with `Ctrl+C`.

The prototype intentionally listens only on the local computer. A second user
should clone and run it on their own machine; this repository is not configured
as a public production deployment.

## How to use Decision Desk

The left side is the shared decision workspace. It shows:

- Stripe and dLocal as the alternatives;
- the four criteria used to compare them;
- evidence attached to each alternative and criterion;
- unresolved evidence or ownership gaps;
- proposals and commitments awaiting review.

The right side is the facilitator. It reads the current page context, so the
user does not need to describe the entire decision again.

### Official test flow

1. Open the application and confirm that the payment-gateway decision, both
   alternatives, four criteria, and three initial gaps are visible.
2. Click **Investigá dLocal**, or send:

   ```text
   Investigá cobertura local y costos de dLocal para Paraguay y Brasil. Adjuntá al mapa únicamente evidencia con fuentes reales.
   ```

3. Wait for the agent and confirm that the evidence appears in the correct
   dLocal cells. Open at least one source link.
4. Click **Proponé compromisos**, or send:

   ```text
   Con la evidencia disponible, prepará la propuesta provisional oficial y dejá los compromisos listos para aprobación. No crees tareas todavía.
   ```

5. Review the provisional recommendation and the commitments assigned to Diego
   and Sofía. At this point no external task has been created.
6. Click **Rechazar** once and confirm that the proposal disappears without
   creating an Ambiguous record.
7. Prepare the proposal again. In a controlled test workspace, click **Aprobar
   y crear**.
8. Confirm that the returned Ambiguous IDs exist in the workspace. Refresh the
   page and verify that the same commitments remain without duplicates.

The exact two-minute presentation sequence is documented in
[DEMO_RUNBOOK.md](DEMO_RUNBOOK.md).

## Verify the project

From the repository root:

```powershell
npm run verify
```

For a production compilation check:

```powershell
npm run build --workspace web
```

Automated tests cover the contracts, tool behavior, approval boundary, failure
handling, and idempotency. They do not replace a live Exa search and Ambiguous
read-back test.

## Troubleshooting

### `npm` is not recognized

Install Node.js 22 or newer, close the terminal, open a new one, and check
`node --version` and `npm --version` again.

### The chat does not answer

Make sure `MODEL_PROVIDER`, its matching API key, and `MODEL` agree. Restart
`npm run dev:web` after changing `.env`.

### Research reports a missing `EXA_API_KEY`

Add the key to the root `.env`, save it, and restart the server. Do not replace
missing research with invented links.

### Approval reports that Ambiguous is unconfigured

Add `AMBIGUOUS_API_KEY` to the root `.env` and restart. Verify that the key
belongs to the intended workspace. A `401` normally means invalid credentials;
a `403` normally means insufficient permissions.

### CopilotKit shows a runtime route 404

Update and restart from a clean dependency installation:

```powershell
git pull --ff-only origin main
npm ci
npm run dev:web
```

Then hard-refresh the browser.

### Port 3100 is already in use

Stop the previous Decision Desk server with `Ctrl+C`. The local approval
boundary expects port 3100, so changing ports is not the first fix.

## Technology

- **Next.js + TypeScript** for the web application.
- **CopilotKit** for page context, conversation, and agent/UI interaction.
- **OpenRouter or OpenAI API** for the language model.
- **Exa** for live research with inspectable sources.
- **Ambiguous AI** for persistent tasks created after human approval.

## Repository guide

| Location | Purpose |
| --- | --- |
| `apps/web/src/components/decision-desk/` | Decision map, evidence, gaps, and approval UI |
| `apps/web/src/lib/` | Decision data and client/server contracts |
| `apps/web/src/app/api/` | CopilotKit runtime and guarded approval endpoints |
| `packages/agent-core/` | Model selection, prompt, schemas, Exa research, and tools |
| [PROYECTO.md](PROYECTO.md) | Product source of truth and exact contracts |
| [TEAM_SETUP.md](TEAM_SETUP.md) | Git, branches, roles, Codex, and Claude Code onboarding |
| [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md) | Recording and presentation procedure |
| [SUBMISSION.md](SUBMISSION.md) | Hackathon submission checklist |

## Team

| Member | Role | Contribution |
| --- | --- | --- |
| Sebastián López | P1 — Frontend | Decision workspace, evidence matrix, proposal review, responsive UI |
| Hans Mersch | P2 — Agent | Prompt, schemas, Exa research, tool orchestration, demo presentation |
| Ingrid Morinigo | P3 — Server | Decision data, approval API, Ambiguous persistence, read-back, idempotency |
| Jhonatan Insfran | P4 — Integration | Git integration, shared skills and guides, verification, demo and submission coordination |

Contributors must read [AGENTS.md](AGENTS.md), [PROYECTO.md](PROYECTO.md), and
[TEAM_SETUP.md](TEAM_SETUP.md) before editing.

## Inherited foundation and hackathon work

This project started from
[`CopilotKit/agents-everywhere-starter-kit`](https://github.com/CopilotKit/agents-everywhere-starter-kit).
The monorepo structure, Next.js/CopilotKit foundation, provider configuration,
approval pattern, and starter tests were inherited.

During the hackathon, BOC built the Decision Desk domain and core workflow: the
payment-gateway decision, typed alternatives and criteria, contextual gap
detection, criterion-specific Exa research, evidence matrix, provisional
proposals, explicit approval UI, and idempotent Ambiguous commitments with real
read-back.

## Security

- Keep personal API keys out of commits, chat, screenshots, and recordings.
- Use a disposable or controlled Ambiguous workspace for the demo.
- Review every proposal before approval because approval creates real records.
- Rotate shared hackathon credentials after the event.

License: [MIT](LICENSE).
