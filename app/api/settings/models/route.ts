import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getAISettings } from "@/modules/settings/service";

const SKIP = /embedding|whisper|tts|speech|dall-e|image|realtime|audio|rerank|moderation/i;

export interface ModelEntry {
  id: string;
  category: "free" | "paid" | "other";
}

function categorize(m: any): ModelEntry | null {
  const id = typeof m === "string" ? m : m?.id;
  if (typeof id !== "string" || !id || SKIP.test(id)) return null;
  const p = m?.pricing;
  if (p) {
    const total = Number(p.prompt ?? 0) + Number(p.completion ?? 0) + Number(p.request ?? 0);
    return { id, category: total === 0 ? "free" : "paid" };
  }
  return { id, category: "other" };
}

export async function POST(req: NextRequest) {
  requireUser();
  const saved = getAISettings();
  const body = await req.json().catch(() => ({}));
  const apiKey = body?.apiKey || saved.apiKey;
  const baseUrl = body?.baseUrl || saved.baseUrl;
  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: "Configure and save a provider first", models: [] }, { status: 400 });
  }
  try {
    const res = await fetch(`${String(baseUrl).replace(/\/$/, "")}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const errBody = await res.text();
      let msg = errBody.slice(0, 200);
      try {
        const e = JSON.parse(errBody)?.error;
        if (typeof e === "string") msg = e;
        else if (e?.message) msg = e.message;
      } catch {}
      return NextResponse.json({ error: `Model list failed (${res.status}): ${msg}`, models: [] }, { status: 400 });
    }
    const d = await res.json();
    const seen = new Set<string>();
    const modelEntries = ((d.data ?? []) as any[])
      .map(categorize)
      .filter((m: ModelEntry | null): m is ModelEntry => m !== null && !seen.has(m.id) && !!seen.add(m.id));
    const order = { free: 0, paid: 1, other: 2 };
    modelEntries.sort((a, b) => order[a.category] - order[b.category] || a.id.localeCompare(b.id));
    return NextResponse.json({ models: modelEntries });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, models: [] }, { status: 400 });
  }
}