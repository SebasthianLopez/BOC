import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { resolveModel } from "./model";
import { SYSTEM_PROMPT } from "./prompt";
import { decisionDeskTools } from "./decision-tools";

/**
 * The agent factory.
 *
 * Return a FRESH agent per threadId — never share one stateful instance across
 * conversations. Channels clones the agent per turn anyway, but a factory is the
 * documented shape and keeps per-thread state honest.
 *
 * To swap in LangGraph, CrewAI, Mastra, Pydantic AI, or Google ADK, replace the
 * body with an HttpAgent pointed at your agent's AG-UI endpoint:
 *
 *   import { HttpAgent } from "@ag-ui/client";
 *   return new HttpAgent({ url: process.env.AGENT_URL! });
 *
 * Nothing else in the kit changes. That is the point of AG-UI.
 */
export type AgentFactoryOptions = {
  /** Retained for caller compatibility; Decision Desk never exposes workplace MCP. */
  workplace?: boolean;
  /** Override the Decision Desk prompt for a surface-specific presentation. */
  prompt?: string;
};

/** The verifiable BuiltInAgent configuration for the Decision Desk runtime. */
export function decisionDeskAgentConfig(
  model: ReturnType<typeof resolveModel>,
  prompt = SYSTEM_PROMPT,
) {
  return {
    model,
    prompt,

    // maxSteps defaults to 1, which would stop after the server half of a
    // P2→P1 chain before the model can call the visual P1 tool.
    maxSteps: 10,

    // No MCP/Ambiguous write tool is ever attached to the Decision Desk agent.
    tools: decisionDeskTools,
    mcpServers: [],
  };
}

export function makeAgent(threadId: string, options: AgentFactoryOptions = {}) {
  const agent = new BuiltInAgent(
    decisionDeskAgentConfig(resolveModel(), options.prompt ?? SYSTEM_PROMPT),
  );
  agent.threadId = threadId;
  return agent;
}
