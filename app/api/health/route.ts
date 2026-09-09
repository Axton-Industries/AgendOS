import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { getAverages, listMetrics, upsertMetrics } from "@/modules/health/service";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  return NextResponse.json({ metrics: listMetrics(auth.user.id), averages: getAverages(auth.user.id) });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    const metric = upsertMetrics(auth.user.id, {
      date: body.date,
      sleepHours: body.sleepHours != null && body.sleepHours !== "" ? parseFloat(body.sleepHours) : null,
      steps: body.steps != null && body.steps !== "" ? parseInt(body.steps) : null,
      weightKg: body.weightKg != null && body.weightKg !== "" ? parseFloat(body.weightKg) : null,
      restingHr: body.restingHr != null && body.restingHr !== "" ? parseInt(body.restingHr) : null,
      note: body.note,
    });
    return NextResponse.json({ metric });
  } catch (e: any) {
    return badRequest(e.message);
  }
}
