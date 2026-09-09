import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { createReminder, getNotifications, listReminders } from "@/modules/notifications/service";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  return NextResponse.json({
    reminders: listReminders(auth.user.id, true),
    notifications: getNotifications(auth.user.id),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    return NextResponse.json({ reminder: createReminder(auth.user.id, body) });
  } catch (e: any) {
    return badRequest(e.message);
  }
}
