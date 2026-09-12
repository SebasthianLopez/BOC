import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FollowupService } from "./followups";
import type { Workplace, WorkplaceTask } from "./workplace";

const session = "a".repeat(64);
const proposal = { decisionId: "boc-payment-gateway", recommendation: "Probar dLocal de manera provisional.", rationale: "Falta validar costos y compliance.", commitments: [{ title: "Crear prueba sandbox de dLocal", owner: "Diego", dueDate: "Antes del siguiente hito" }, { title: "Solicitar cotización y validar compliance", owner: "Sofía", dueDate: "Antes del siguiente hito" }] };
class FakeWorkplace implements Workplace {
  tasks: WorkplaceTask[] = []; creates = 0;
  async identity() { return { id: "u1", workspaceId: "w1", name: "Demo" }; }
  async list(marker: string) { return this.tasks.filter((task) => task.description.includes(marker)); }
  async get(id: string) { const task = this.tasks.find((item) => item.id === id); if (!task) throw new Error("missing"); return task; }
  async create(title: string, description: string, beforeWrite: () => Promise<void>) { await beforeWrite(); const task = { id: `11111111-1111-4111-8111-${String(++this.creates).padStart(12, "0")}`, title, description, url: `https://app.ambiguous.ai/tasks/${this.creates}` }; this.tasks.push(task); return task; }
}
async function fixture(t: TestContext) { const directory = await mkdtemp(join(tmpdir(), "decision-desk-")); t.after(() => rm(directory, { recursive: true, force: true })); const workplace = new FakeWorkplace(); return { directory, workplace, service: new FollowupService(workplace, directory) }; }

test("approval creates every displayed commitment and returns real Ambiguous IDs and URLs", async (t) => {
  const { service, workplace } = await fixture(t);
  const prepared = await service.prepare(session, proposal);
  const commitments = await service.approve(session, prepared.id);
  assert.equal(workplace.creates, 2);
  assert.deepEqual(commitments.map(({ title, owner, dueDate }) => ({ title, owner, dueDate })), proposal.commitments);
  assert.ok(commitments.every((commitment) => commitment.ambiguousId && commitment.url.startsWith("https://app.ambiguous.ai/")));
});
test("same approval, including after restart, does not duplicate commitments and read-back is decision keyed", async (t) => {
  const { service, workplace, directory } = await fixture(t);
  const prepared = await service.prepare(session, proposal);
  await service.approve(session, prepared.id); await service.approve(session, prepared.id);
  const restarted = new FollowupService(workplace, directory);
  assert.equal((await restarted.approve(session, prepared.id)).length, 2);
  assert.equal(workplace.creates, 2);
  assert.equal((await restarted.list(proposal.decisionId)).length, 2);
});
test("decline and a foreign-session approval create zero tasks", async (t) => {
  const { service, workplace } = await fixture(t);
  const declined = await service.prepare(session, proposal);
  await service.deny(session, declined.id);
  await assert.rejects(service.approve(session, declined.id), /declined/);
  const prepared = await service.prepare(session, proposal);
  await assert.rejects(service.approve("b".repeat(64), prepared.id), /session/);
  assert.equal(workplace.creates, 0);
});
