import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getAISettings } from "@/modules/settings/service";

const SKIP = /embedding|whisper|tts|speech|dall-e|image|realtime|audio|rerank|moderation/i;

export async function GET() {
  requireUser();
  const { apiKey, baseUrl } = getAISettings();
  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: "Configure and save a provider first", models: [] }, { status: 400 });
  }
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: `Model list failed (${res.status}): ${body.slice(0, 200)}`, models: [] },
        { status: 400 }
      );
    }
    const d = await res.json();
    const models = (d.data ?? [])
      .map((m: any) => (typeof m === "string" ? m : m.id))
      .filter((id: string) => typeof id === "string" && id && !SKIP.test(id));
    return NextResponse.json({ models: [...new Set(models)].sort() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, models: [] }, { status: 400 });
  }
}