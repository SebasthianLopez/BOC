import { randomBytes } from "node:crypto";
import { z } from "zod";
import { FollowupError } from "./followup-error";
import { FollowupService } from "./followups";
import type { Workplace } from "./workplace";

const cookieName = "web-followup-session";
const setup = "Set AMBIGUOUS_API_KEY in root .env and restart the web app. Saving and retrieval require a real Ambiguous workspace.";
const proposalSchema = z.object({ decisionId: z.string(), recommendation: z.string(), rationale: z.string(), commitments: z.array(z.object({ title: z.string(), owner: z.string(), dueDate: z.string() }).strict()) }).strict();

export function createFollowupHandler(options: { connect(): { workplace: Workplace; close(): Promise<void> } | undefined; directory: string }) {
  return async (request: Request) => {
    const url = new URL(request.url);
    const expected = new URL(url); expected.host = request.headers.get("host") || url.host;
    const cookie = request.headers.get("cookie")?.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    const hasSession = !!cookie && /^[a-f0-9]{64}$/.test(cookie);
    const session = hasSession ? cookie! : randomBytes(32).toString("hex");
    const reply = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store", ...(!hasSession ? { "Set-Cookie": `${cookieName}=${session}; HttpOnly; SameSite=Strict; Path=/api/followups; Max-Age=86400${url.protocol === "https:" ? "; Secure" : ""}` } : {}) } });
    if (!["localhost", "127.0.0.1", "[::1]"].includes(expected.hostname)) return Response.json({ error: "This demo accepts loopback hosts only." }, { status: 403 });
    if (request.method !== "GET" && request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
    if (request.method === "POST" && (request.headers.get("origin") !== expected.origin || !request.headers.get("content-type")?.startsWith("application/json") || !hasSession)) return reply({ error: "Use the approval controls from this app's own page after starting a browser session." }, 403);
    if (request.method === "GET" && url.searchParams.get("session") === "1") return reply({ status: "ready" });
    let connection: ReturnType<typeof options.connect>;
    try {
      const input = request.method === "POST"
        ? proposalSchema.parse(JSON.parse(await request.text()))
        : undefined;
      connection = options.connect();
      if (!connection) return reply(request.method === "GET" ? { status: "unconfigured", message: setup } : { error: setup }, request.method === "GET" ? 200 : 503);
      const service = new FollowupService(connection.workplace, options.directory);
      if (request.method === "GET") {
        const decisionId = url.searchParams.get("decisionId");
        if (!decisionId) return reply({ error: "decisionId is required." }, 400);
        return reply({ commitments: await service.list(decisionId) });
      }
      const commitments = await service.approve(session, input);
      return reply({ commitments });
    } catch (error) {
      if (error instanceof z.ZodError || error instanceof SyntaxError) return reply({ error: "Invalid approved proposal." }, 400);
      const message = error instanceof FollowupError ? error.message : "Unable to reach Ambiguous or the approval store. Check server configuration, permissions, and persistent disk, then refresh.";
      return reply({ error: message }, 502);
    } finally {
      if (connection) try { await connection.close(); } catch { console.warn("Ambiguous workplace cleanup failed after response handling."); }
    }
  };
}
