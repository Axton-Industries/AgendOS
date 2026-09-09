import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getForecast } from "@/modules/weather/service";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  let lat = parseFloat(searchParams.get("lat") ?? "");
  let lon = parseFloat(searchParams.get("lon") ?? "");
  let name = searchParams.get("name") ?? "";

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    lat = auth.user.lat ?? 40.4168; // default: Madrid
    lon = auth.user.lon ?? -3.7038;
    name = auth.user.location_name ?? "Madrid, Spain";
  }

  try {
    const forecast = await getForecast(lat, lon);
    return NextResponse.json({ place: name, lat, lon, ...forecast });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
