import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { complete } from "@/modules/ai/service";
import { getAISettings } from "@/modules/settings/service";

export async function POST(req: NextRequest) {
  requireUser();
  const saved = getAISettings();
  const body = await req.json().catch(() => ({}));
  const ai = body?.ai;
  const override = {
    baseUrl: ai?.baseUrl || saved.baseUrl,
    model: ai?.model || saved.model,
    apiKey: ai?.apiKey || saved.apiKey,
  };
  try {
    const { content } = await complete([{ role: "user", content: "Reply with exactly: OK" }], undefined, override);
    return NextResponse.json({ ok: true, reply: content.slice(0, 200) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}