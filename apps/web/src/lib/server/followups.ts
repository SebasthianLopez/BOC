import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { findDecision, type Proposal } from "../decisions";
import type { Commitment } from "../followup-types";
import { FollowupError } from "./followup-error";
import type { Workplace, WorkplaceTask } from "./workplace";

const commitmentSchema = z.object({ title: z.string().trim().min(1).max(200), owner: z.string().trim().min(1).max(120), dueDate: z.string().trim().min(1).max(80) }).strict();
const proposalSchema = z.object({ decisionId: z.string().min(1), recommendation: z.string().trim().min(1).max(4000), rationale: z.string().trim().min(1).max(8000), commitments: z.array(commitmentSchema).min(1).max(20) }).strict();
const storedSchema = z.object({ sessionHash: z.string(), workspaceId: z.string(), identityId: z.string(), proposal: proposalSchema, expiresAt: z.number() });
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const isExists = (error: unknown) => error instanceof Error && "code" in error && error.code === "EEXIST";

export class FollowupService {
  constructor(private workplace: Workplace, private directory: string, private now = Date.now) {}
  private key(identity: { workspaceId: string }, proposal: Proposal) { return hash(JSON.stringify([identity.workspaceId, proposal])); }
  private marker(decisionId: string, key: string) { return `decision-desk:${decisionId}\napproval:${key}`; }
  private description(proposal: Proposal, commitment: Proposal["commitments"][number], key: string) {
    return [proposal.rationale, `Recommendation: ${proposal.recommendation}`, `Owner: ${commitment.owner}`, `Due date: ${commitment.dueDate}`, this.marker(proposal.decisionId, key)].join("\n\n");
  }
  private output(task: WorkplaceTask, commitment: Proposal["commitments"][number]): Commitment {
    if (!task.url) throw new FollowupError("Ambiguous returned no record link; the commitment cannot be confirmed.");
    return { ...commitment, ambiguousId: task.id, url: task.url };
  }
  async list(decisionId: string): Promise<Commitment[]> {
    findDecision(decisionId);
    const tasks = await this.workplace.list(`decision-desk:${decisionId}`);
    return tasks.map((task) => {
      const owner = /^Owner: (.+)$/m.exec(task.description)?.[1];
      const dueDate = /^Due date: (.+)$/m.exec(task.description)?.[1];
      if (!owner || !dueDate || !task.url) throw new FollowupError("Ambiguous returned an incomplete Decision Desk commitment.");
      return { title: task.title, owner, dueDate, ambiguousId: task.id, url: task.url };
    });
  }
  async approve(session: string, input: unknown): Promise<Commitment[]> {
    const proposal = proposalSchema.parse(input);
    findDecision(proposal.decisionId);
    const identity = await this.workplace.identity();
    const key = this.key(identity, proposal);
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const path = join(this.directory, `${key}.json`);
    const stored = { sessionHash: hash(session), workspaceId: identity.workspaceId, identityId: identity.id, proposal, expiresAt: this.now() + 10 * 60_000 };
    try { await writeFile(path, JSON.stringify(stored), { flag: "wx", mode: 0o600 }); } catch (error) { if (!isExists(error)) throw error; }
    const approved = storedSchema.parse(JSON.parse(await readFile(path, "utf8")));
    if (approved.sessionHash !== hash(session)) throw new FollowupError("This approval belongs to another browser session.");
    if (approved.workspaceId !== identity.workspaceId || approved.identityId !== identity.id) throw new FollowupError("The connected workspace or identity changed. Prepare a new proposal before approving.");
    if (approved.expiresAt <= this.now()) throw new FollowupError("This approval expired. Prepare and review a new proposal.");
    const commitments: Commitment[] = [];
    for (const [index, commitment] of approved.proposal.commitments.entries()) {
      const description = this.description(approved.proposal, commitment, key);
      const matches = (await this.workplace.list(this.marker(approved.proposal.decisionId, key))).filter((task) => task.title === commitment.title && task.description === description);
      if (matches.length > 1) throw new FollowupError("Ambiguous contains multiple matching commitments; inspect the workspace before continuing.");
      const task = matches[0] ?? await this.workplace.create(commitment.title, description, async () => {
        if (approved.expiresAt <= this.now()) throw new FollowupError("This approval expired before the write. Nothing was sent.");
        try { await writeFile(join(this.directory, `${key}-${index}.attempt`), "sent", { flag: "wx", mode: 0o600 }); }
        catch (error) {
          if (isExists(error)) throw new FollowupError("The write outcome is uncertain or still in progress. Refresh to reconcile from Ambiguous.");
          throw error;
        }
      });
      const readBack = await this.workplace.get(task.id);
      if (readBack.title !== commitment.title || readBack.description !== description) throw new FollowupError("Ambiguous commitment differs from the approved fields. Inspect the workspace; do not create it again.");
      commitments.push(this.output(readBack, commitment));
    }
    return commitments;
  }
}
