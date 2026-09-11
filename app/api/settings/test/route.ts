import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { complete } from "@/modules/ai/service";

export async function POST() {
  requireUser();
  try {
    const { content } = await complete([
      { role: "user", content: "Reply with exactly: OK" },
    ]);
    return NextResponse.json({ ok: true, reply: content.slice(0, 200) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}