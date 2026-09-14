import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { createReminder, getNotifications, listReminders } from "@/modules/notifications/service";

export async function GET(req: NextRequest) {
  const user = requireUser();
  const lang = (new URL(req.url).searchParams.get("lang") === "es" ? "es" : "en") as "en" | "es";
  return NextResponse.json({
    reminders: listReminders(user.id, true),
    notifications: getNotifications(user.id, lang),
  });
}

export async function POST(req: NextRequest) {
  const user = requireUser();
  try {
    const body = await req.json();
    return NextResponse.json({ reminder: createReminder(user.id, body) });
  } catch (e: any) {
    return badRequest(e.message);
  }
}
