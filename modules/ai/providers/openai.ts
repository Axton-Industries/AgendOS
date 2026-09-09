import type { AIMessage, AIToolSchema, ToolCall } from "../provider";

// OpenAI-compatible provider. Works with OpenAI itself and any compatible
// endpoint (OpenRouter, Ollama, LM Studio, ...) via AI_BASE_URL.
export const openAIProvider = {
  name: "openai",

  async complete(messages: AIMessage[], tools?: AIToolSchema[]) {
    const base = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
    const model = process.env.AI_MODEL ?? "gpt-4o-mini";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        ...(tools?.length ? { tools, tool_choice: "auto" } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI provider error (${res.status}): ${body.slice(0, 300)}`);
    }
    const d = await res.json();
    const msg = d.choices[0].message;
    const toolCalls: ToolCall[] = (msg.tool_calls ?? []).map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      args: (() => { try { return JSON.parse(tc.function.arguments); } catch { return {}; } })(),
    }));
    return { content: msg.content ?? "", toolCalls };
  },
};
