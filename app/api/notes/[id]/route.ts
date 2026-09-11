import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { deleteNote, updateNote } from "@/modules/notes/service";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { user } = requireUser();
  try {
    const body = await req.json();
    const note = updateNote(user.id, (await params).id, body);
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ note });
  } catch (e: any) {
    return badRequest(e.message);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { user } = requireUser();
  const ok = deleteNote(user.id, (await params).id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
