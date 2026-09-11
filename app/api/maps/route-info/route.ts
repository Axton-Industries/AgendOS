import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getRoute } from "@/modules/maps/service";
import { geocode } from "@/modules/weather/service";

export async function GET(req: NextRequest) {
  const user = requireUser();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  const mode = searchParams.get("mode") ?? "car";
  if (!from || !to) return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  try {
    const [a, b] = await Promise.all([geocode(from), geocode(to)]);
    if (!a) return NextResponse.json({ error: `Origin '${from}' not found` }, { status: 400 });
    if (!b) return NextResponse.json({ error: `Destination '${to}' not found` }, { status: 400 });
    const route = await getRoute(
      { lat: a.lat, lon: a.lon, name: a.name },
      { lat: b.lat, lon: b.lon, name: b.name },
      mode
    );
    return NextResponse.json({ route }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
