import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createFollowupHandler } from "./followup-http";
import type { Workplace, WorkplaceTask } from "./workplace";

const origin = "http://localhost:3100";
const cookie = `web-followup-session=${"a".repeat(64)}`;
const proposal = { decisionId: "boc-payment-gateway", recommendation: "dLocal provisional", rationale: "Validar costos.", commitments: [{ title: "Probar sandbox", owner: "Diego", dueDate: "Próximo hito" }] };
const post = (body: unknown, headers: Record<string, string> = {}) => new Request(`${origin}/api/followups`, { method: "POST", headers: { origin, cookie, "content-type": "application/json", ...headers }, body: JSON.stringify(body) });

test("POST returns exactly the persisted commitments contract and GET reads by decisionId", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "decision-http-")); t.after(() => rm(directory, { recursive: true, force: true }));
  const records: WorkplaceTask[] = [];
  const workplace: Workplace = {
    async identity() { return { id: "u1", workspaceId: "w1", name: "Demo" }; },
    async list(marker) { return records.filter((record) => record.description.includes(marker)); },
    async get(id) { return records.find((record) => record.id === id)!; },
    async create(title, description, beforeWrite) { await beforeWrite(); const task = { id: "11111111-1111-4111-8111-111111111111", title, description, url: "https://app.ambiguous.ai/tasks/1" }; records.push(task); return task; },
  };
  const handler = createFollowupHandler({ connect: () => ({ workplace, async close() {} }), directory });
  const preparedResponse = await handler(post({ operation: "prepare", proposal }));
  const { proposal: prepared } = await preparedResponse.json();
  const response = await handler(post({ operation: "approve", proposalId: prepared.id }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ["commitments"]);
  assert.deepEqual(Object.keys(body.commitments[0]).sort(), ["ambiguousId", "dueDate", "owner", "title", "url"]);
  assert.equal((await handler(new Request(`${origin}/api/followups?decisionId=boc-payment-gateway`, { headers: { cookie } }))).status, 200);
  assert.equal(records.length, 1);
});
test("cross-origin, absent-session, malformed, and unconfigured approval requests do not write", async () => {
  const handler = createFollowupHandler({ connect: () => undefined, directory: "/unused" });
  assert.equal((await handler(post({ operation: "prepare", proposal }, { origin: "https://evil.example" }))).status, 403);
  assert.equal((await handler(new Request(`${origin}/api/followups`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ operation: "prepare", proposal }) }))).status, 403);
  assert.equal((await handler(post({}))).status, 400);
  assert.equal((await handler(post({ operation: "prepare", proposal }))).status, 503);
});
