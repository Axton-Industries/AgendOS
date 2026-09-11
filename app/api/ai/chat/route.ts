import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { isAIConfigured, runAssistant } from "@/modules/ai/service";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { user } = requireUser();
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI is not configured. Set AI_API_KEY (and optionally AI_BASE_URL / AI_MODEL) in .env.local and restart the server." },
      { status: 503 }
    );
  }
  try {
    const { message } = await req.json();
    if (!message?.trim()) return badRequest("Message is required");
    const reply = await runAssistant(user.id, message.trim(), user);
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
