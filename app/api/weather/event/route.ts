import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getEvent } from "@/modules/calendar/service";
import { weatherForEvent } from "@/modules/weather/service";

export async function GET(req: NextRequest) {
  const { user } = requireUser();
  const eventId = new URL(req.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

  const event = getEvent(user.id, eventId);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!event.location) return NextResponse.json({ weather: null });

  try {
    const weather = await weatherForEvent(event.location, event.start);
    return NextResponse.json({ weather });
  } catch (e: any) {
    return NextResponse.json({ weather: { available: false, note: "Weather lookup failed" } });
  }
}
