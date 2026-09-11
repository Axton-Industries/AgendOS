import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getForecast } from "@/modules/weather/service";

export async function GET(req: NextRequest) {
  const user = requireUser();

  const { searchParams } = new URL(req.url);
  let lat = parseFloat(searchParams.get("lat") ?? "");
  let lon = parseFloat(searchParams.get("lon") ?? "");
  let name = searchParams.get("name") ?? "";

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    lat = user.lat ?? 40.4168; // default: Madrid
    lon = user.lon ?? -3.7038;
    name = user.location_name ?? "Madrid, Spain";
  }

  try {
    const forecast = await getForecast(lat, lon);
    return NextResponse.json({ place: name, lat, lon, ...forecast }, {
      headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=3600" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
