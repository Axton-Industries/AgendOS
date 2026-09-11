import { db, newId, nowIso } from "@/lib/db";
import { toolSchemas, executeTool } from "./tools";
import { friendlyDate, nowDateTimeStr } from "@/lib/dates";
import type { User } from "@/modules/auth/service";
import { getAISettings, type AISettings } from "@/modules/settings/service";

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

export function isAIConfigured() {
  return !!getAISettings().apiKey;
}

/** OpenAI-compatible chat. Works with OpenAI and any compatible endpoint (OpenRouter, Ollama, LM Studio...). */
export async function complete(
  messages: AIMessage[],
  tools?: AIToolSchema[],
  settings: AISettings = getAISettings()
): Promise<{ content: string; toolCalls: ToolCall[] }> {
  const { apiKey, baseUrl, model } = settings;
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(tools?.length ? { tools, tool_choice: "auto" } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(providerError(res.status, await res.text()));
  }
  const d = await res.json();
  const msg = d.choices[0].message;
  const toolCalls: ToolCall[] = (msg.tool_calls ?? []).map((tc: any) => ({
    id: tc.id,
    name: tc.function.name,
    args: safeParse(tc.function.arguments),
  }));
  return { content: msg.content ?? "", toolCalls };
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

/** Turns a provider error body into a readable message (OpenRouter/Gemini return JSON with error.message). */
function providerError(status: number, body: string) {
  let msg = body;
  try {
    const e = JSON.parse(body)?.error;
    if (typeof e === "string") msg = e;
    else if (e?.message) msg = e.message;
  } catch {}
  return `AI provider error (${status}): ${msg.slice(0, 500)}`;
}

const MAX_TOOL_ROUNDS = 6;

function systemPrompt(user: User) {
  const location = user.location_name ? `${user.location_name} (user's saved location)` : "unknown (ask or default to their city)";
  return `You are the AgendOS assistant. You help the user with their calendar, weather and personal finances using the provided tools. Always use tools to read or change real data — never invent events or transactions. When asked about anything not in the user's own data, search the internet with web_search (and web_read to dig into a page) before answering.

Today is ${friendlyDate(nowDateTimeStr().slice(0, 10))}. Current time: ${nowDateTimeStr()}.
User location: ${location}.

Event datetimes use the format 'YYYY-MM-DD HH:mm' (24-hour). Amounts are in euros (EUR). When creating or updating events, resolve relative dates like "tomorrow" to real dates yourself. Answer concisely.`;
}

export async function runAssistant(userId: string, userMessage: string, user: User): Promise<string> {
  const history = db
    .prepare("SELECT role, content FROM ai_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 20")
    .all(userId) as any[];

  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt(user) },
    ...history.reverse().map((m) => ({ role: m.role, content: m.content }) as AIMessage),
    { role: "user", content: userMessage },
  ];

  saveMessage(userId, "user", userMessage);

  let reply = "";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const { content, toolCalls } = await complete(messages, toolSchemas);
    if (!toolCalls.length) {
      reply = content;
      break;
    }
    messages.push({
      role: "assistant",
      content: content ?? "",
      tool_calls: toolCalls.map((tc) => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.name, arguments: JSON.stringify(tc.args) },
      })),
    });
    for (const tc of toolCalls) {
      const result = await executeTool(tc.name, tc.args, userId, user);
      messages.push({ role: "tool", content: result, tool_call_id: tc.id });
    }
  }

  if (!reply) reply = "I couldn't complete that request.";
  saveMessage(userId, "assistant", reply);
  return reply;
}

export function getMessages(userId: string, limit = 50) {
  return (db
    .prepare("SELECT role, content, created_at FROM ai_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
    .all(userId, limit) as any[]).reverse();
}

function saveMessage(userId: string, role: string, content: string) {
  db.prepare("INSERT INTO ai_messages (id, user_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)").run(
    newId(), userId, role, content, nowIso()
  );
}