import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { createNote, listNotes } from "@/modules/notes/service";

export async function GET(req: NextRequest) {
  const { user } = requireUser();
  const q = new URL(req.url).searchParams.get("q") ?? undefined;
  return NextResponse.json({ notes: listNotes(user.id, q) });
}

export async function POST(req: NextRequest) {
  const { user } = requireUser();
  try {
    const body = await req.json();
    return NextResponse.json({ note: createNote(user.id, body) });
  } catch (e: any) {
    return badRequest(e.message);
  }
}
