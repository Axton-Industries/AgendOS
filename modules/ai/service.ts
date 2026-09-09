import { db, newId, nowIso } from "@/lib/db";
import type { AIMessage } from "./provider";
import { openAIProvider } from "./providers/openai";
import { toolSchemas, executeTool } from "./tools";
import { friendlyDate, nowDateTimeStr } from "@/lib/dates";
import type { User } from "@/modules/auth/service";

export function isAIConfigured() {
  return !!process.env.AI_API_KEY;
}

const MAX_TOOL_ROUNDS = 6;

function systemPrompt(user: User) {
  const location = user.location_name ? `${user.location_name} (user's saved location)` : "unknown (ask or default to their city)";
  return `You are the Life OS assistant. You help the user with their calendar, weather and personal finances using the provided tools. Always use tools to read or change real data — never invent events or transactions.

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

  const provider = openAIProvider;
  let reply = "";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const { content, toolCalls } = await provider.complete(messages, toolSchemas);
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
