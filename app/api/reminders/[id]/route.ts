import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { completeReminder, deleteReminder } from "@/modules/notifications/service";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const ok = completeReminder(auth.user.id, (await params).id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const ok = deleteReminder(auth.user.id, (await params).id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
