import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { deletePlace, listPlaces, savePlace } from "@/modules/maps/service";

export async function GET(req: NextRequest) {
  const user = requireUser();
  return NextResponse.json({ places: listPlaces(user.id) });
}

export async function POST(req: NextRequest) {
  const user = requireUser();
  try {
    const { query } = await req.json();
    const place = await savePlace(user.id, query);
    return NextResponse.json({ place });
  } catch (e: any) {
    return badRequest(e.message);
  }
}

export async function DELETE(req: NextRequest) {
  const user = requireUser();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return badRequest("Missing id");
  const ok = deletePlace(user.id, id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
