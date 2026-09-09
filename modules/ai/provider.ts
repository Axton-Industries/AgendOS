// AI provider abstraction. Internal message format follows the OpenAI chat
// convention (role/content/tool_calls); providers map to their own wire format.

export interface ToolCall {
  id: string;
  name: string;
  args: any;
}

export interface AIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

export interface AIToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}
