import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { createEvent, listEvents } from "@/modules/calendar/service";

export async function GET(req: NextRequest) {
  const { user } = requireUser();
  const { searchParams } = new URL(req.url);
  const events = listEvents(user.id, searchParams.get("from") ?? undefined, searchParams.get("to") ?? undefined);
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const { user } = requireUser();
  try {
    const body = await req.json();
    const event = createEvent(user.id, body);
    return NextResponse.json({ event });
  } catch (e: any) {
    return badRequest(e.message);
  }
}
