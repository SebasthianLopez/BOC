import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { findDecision, type Proposal } from "../decisions";
import type { Commitment } from "../followup-types";
import { FollowupError } from "./followup-error";
import type { Workplace, WorkplaceTask } from "./workplace";

const commitmentSchema = z.object({ title: z.string().trim().min(1).max(200), owner: z.string().trim().min(1).max(120), dueDate: z.string().trim().min(1).max(80) }).strict();
const proposalSchema = z.object({ decisionId: z.string().min(1), recommendation: z.string().trim().min(1).max(4000), rationale: z.string().trim().min(1).max(8000), commitments: z.array(commitmentSchema).min(1).max(20) }).strict();
const storedSchema = z.object({ id: z.uuid(), sessionHash: z.string(), workspaceId: z.string(), identityId: z.string(), proposal: proposalSchema, expiresAt: z.number() });
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const exists = (error: unknown) => error instanceof Error && "code" in error && error.code === "EEXIST";
export type PreparedProposal = Proposal & { id: string; expiresAt: number };

export class FollowupService {
  constructor(private workplace: Workplace, private directory: string, private now = Date.now) {}
  private path(id: string) { return join(this.directory, `${id}.json`); }
  private marker(decisionId: string, id: string) { return `decision-desk:${decisionId}\napproval:${id}`; }
  private description(proposal: Proposal, commitment: Proposal["commitments"][number], id: string) { return [proposal.rationale, `Recommendation: ${proposal.recommendation}`, `Owner: ${commitment.owner}`, `Due date: ${commitment.dueDate}`, this.marker(proposal.decisionId, id)].join("\n\n"); }
  private output(task: WorkplaceTask, commitment: Proposal["commitments"][number]): Commitment { if (!task.url) throw new FollowupError("Ambiguous returned no record link; the commitment cannot be confirmed."); return { ...commitment, ambiguousId: task.id, url: task.url }; }
  async prepare(session: string, input: unknown): Promise<PreparedProposal> {
    const proposal = proposalSchema.parse(input); findDecision(proposal.decisionId);
    const identity = await this.workplace.identity(); const id = randomUUID(); const expiresAt = this.now() + 10 * 60_000;
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    await writeFile(this.path(id), JSON.stringify({ id, sessionHash: hash(session), workspaceId: identity.workspaceId, identityId: identity.id, proposal, expiresAt }), { flag: "wx", mode: 0o600 });
    return { ...proposal, id, expiresAt };
  }
  private async stored(session: string, id: string) {
    z.uuid().parse(id); const value = storedSchema.parse(JSON.parse(await readFile(this.path(id), "utf8")));
    if (value.sessionHash !== hash(session)) throw new FollowupError("This proposal belongs to another browser session.");
    if (value.expiresAt <= this.now()) throw new FollowupError("This proposal expired. Prepare and review a new proposal.");
    try { const decision = await readFile(`${this.path(id)}.decision`, "utf8"); if (decision === "declined") throw new FollowupError("This proposal was declined."); } catch (error) { if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error; }
    return value;
  }
  async deny(session: string, id: string) { await this.stored(session, id); try { await writeFile(`${this.path(id)}.decision`, "declined", { flag: "wx", mode: 0o600 }); } catch (error) { if (!exists(error)) throw error; } }
  async list(decisionId: string): Promise<Commitment[]> { findDecision(decisionId); return (await this.workplace.list(`decision-desk:${decisionId}`)).map((task) => { const owner = /^Owner: (.+)$/m.exec(task.description)?.[1]; const dueDate = /^Due date: (.+)$/m.exec(task.description)?.[1]; if (!owner || !dueDate || !task.url) throw new FollowupError("Ambiguous returned an incomplete Decision Desk commitment."); return { title: task.title, owner, dueDate, ambiguousId: task.id, url: task.url }; }); }
  async approve(session: string, id: string): Promise<Commitment[]> {
    const saved = await this.stored(session, id); const identity = await this.workplace.identity();
    if (saved.workspaceId !== identity.workspaceId || saved.identityId !== identity.id) throw new FollowupError("The connected workspace or identity changed. Prepare a new proposal before approving.");
    const results: Commitment[] = [];
    for (const [index, commitment] of saved.proposal.commitments.entries()) {
      const description = this.description(saved.proposal, commitment, saved.id); const matches = (await this.workplace.list(this.marker(saved.proposal.decisionId, saved.id))).filter((task) => task.title === commitment.title && task.description === description);
      if (matches.length > 1) throw new FollowupError("Ambiguous contains multiple matching commitments; inspect the workspace before continuing.");
      const task = matches[0] ?? await this.workplace.create(commitment.title, description, async () => { try { await writeFile(join(this.directory, `${saved.id}-${index}.attempt`), "sent", { flag: "wx", mode: 0o600 }); } catch (error) { if (exists(error)) throw new FollowupError("The write outcome is uncertain or still in progress. Refresh to reconcile from Ambiguous."); throw error; } });
      const readBack = await this.workplace.get(task.id); if (readBack.title !== commitment.title || readBack.description !== description) throw new FollowupError("Ambiguous commitment differs from the approved fields. Inspect the workspace; do not create it again."); results.push(this.output(readBack, commitment));
    }
    return results;
  }
}
