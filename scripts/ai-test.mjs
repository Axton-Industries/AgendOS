// Tests the AI tool-calling loop end-to-end against a fake OpenAI-compatible
// endpoint. Run the app with AI_BASE_URL=http://localhost:9911/v1 and a dummy
// AI_API_KEY, then: node scripts/ai-test.mjs
import http from "node:http";

let round = 0;
const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const payload = JSON.parse(body);
    const hasToolResult = payload.messages.some((m) => m.role === "tool");
    console.error(`[fake-ai] round: toolResult=${hasToolResult}, last=${payload.messages.at(-1).content?.slice(0, 60) ?? payload.messages.at(-1).role}`);
    res.setHeader("Content-Type", "application/json");
    if (!hasToolResult) {
      round++;
      const tool = round === 1 ? "calendar_createEvent" : "finance_getSummary";
      const args = tool === "calendar_createEvent"
        ? { title: "AI Test Meeting", start: "2026-09-10 15:00" }
        : {};
      res.end(JSON.stringify({
        choices: [{ message: { role: "assistant", content: null, tool_calls: [{ id: `t${round}`, type: "function", function: { name: tool, arguments: JSON.stringify(args) } }] } }],
      }));
    } else {
      res.end(JSON.stringify({ choices: [{ message: { role: "assistant", content: round === 1 ? "Created your meeting." : "You spent 0 EUR this month." } }] }));
    }
  });
});
server.listen(9911, () => console.error("[fake-ai] listening on 9911"));

// hit the app
await new Promise((r) => setTimeout(r, 500));
const BASE = process.argv[2] ?? "http://localhost:3000";
const call = async (method, path, body) => {
  const res = await fetch(BASE + path, {
    method, headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => null) };
};

let failed = 0;
const check = (name, cond, extra = "") => { console.log(cond ? `  ok  ${name} ${extra}` : `FAIL  ${name} ${extra}`); if (!cond) failed++; };

let r = await call("POST", "/api/ai/chat", { message: "Create a meeting tomorrow at 15:00" });
check("chat: create event via tool", r.status === 200 && r.data?.reply === "Created your meeting.", r.data?.error ?? "");

r = await call("GET", "/api/calendar?from=2026-09-10&to=2026-09-11");
check("event actually persisted by tool", r.data?.events?.some((e) => e.title === "AI Test Meeting"),
  `${r.data?.events?.length ?? 0} events`);

r = await call("POST", "/api/ai/chat", { message: "How much did I spend this month?" });
check("chat: finance via tool", r.status === 200 && r.data?.reply?.includes("0 EUR"), r.data?.error ?? "");

r = await call("GET", "/api/ai/messages");
check("conversation persisted", r.data?.messages?.length >= 4, `${r.data?.messages?.length} messages`);

server.close();
console.log(failed ? `\n${failed} FAILED` : "\nall AI checks passed");
process.exit(failed ? 1 : 0);
