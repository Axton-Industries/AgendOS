import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { deleteEvent, getEvent, updateEvent } from "@/modules/calendar/service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { user } = requireUser();
  const event = getEvent(user.id, (await params).id);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ event });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { user } = requireUser();
  try {
    const body = await req.json();
    const event = updateEvent(user.id, (await params).id, body);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (e: any) {
    return badRequest(e.message);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { user } = requireUser();
  const ok = deleteEvent(user.id, (await params).id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
