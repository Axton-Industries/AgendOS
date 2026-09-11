// Key-value app settings. AI provider config lives here (DB first, env as fallback)
// so the user can change it from the UI without editing .env.local or restarting.
import { db } from "@/lib/db";

export interface AISettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function get(key: string): string | undefined {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as any;
  return row?.value;
}

export function getAISettings(): AISettings {
  return {
    apiKey: get("ai_api_key") ?? process.env.AI_API_KEY ?? "",
    baseUrl: get("ai_base_url") ?? process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
    model: get("ai_model") ?? process.env.AI_MODEL ?? "gpt-4o-mini",
  };
}

export function saveAISettings({ apiKey, baseUrl, model }: { apiKey: string; baseUrl: string; model: string }) {
  const put = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  put.run("ai_api_key", apiKey.trim());
  put.run("ai_base_url", baseUrl.trim());
  put.run("ai_model", model.trim());
}