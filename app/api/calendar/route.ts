import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { createEvent, listEvents } from "@/modules/calendar/service";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(req.url);
  const events = listEvents(auth.user.id, searchParams.get("from") ?? undefined, searchParams.get("to") ?? undefined);
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    const event = createEvent(auth.user.id, body);
    return NextResponse.json({ event });
  } catch (e: any) {
    return badRequest(e.message);
  }
}
