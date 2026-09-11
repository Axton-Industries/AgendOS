import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { getAISettings, saveAISettings } from "@/modules/settings/service";

export async function GET() {
  requireUser();
  const s = getAISettings();
  return NextResponse.json({ ai: { baseUrl: s.baseUrl, model: s.model, hasApiKey: !!s.apiKey } });
}

export async function POST(req: NextRequest) {
  requireUser();
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  const ai = body?.ai;
  if (!ai || typeof ai.baseUrl !== "string" || typeof ai.model !== "string") {
    return badRequest("ai.baseUrl and ai.model are required");
  }
  const apiKey = typeof ai.apiKey === "string" ? ai.apiKey : "";
  saveAISettings({ baseUrl: ai.baseUrl, model: ai.model, apiKey });
  return NextResponse.json({ ok: true });
}