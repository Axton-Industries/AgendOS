import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { createNote, listNotes } from "@/modules/notes/service";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const q = new URL(req.url).searchParams.get("q") ?? undefined;
  return NextResponse.json({ notes: listNotes(auth.user.id, q) });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    return NextResponse.json({ note: createNote(auth.user.id, body) });
  } catch (e: any) {
    return badRequest(e.message);
  }
}
