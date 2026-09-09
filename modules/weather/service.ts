import type { Forecast } from "./provider";
import { openMeteoProvider } from "./providers/openmeteo";

export interface GeoPlace {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export async function geocode(query: string): Promise<GeoPlace | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  );
  if (!res.ok) throw new Error("Geocoding request failed");
  const d = await res.json();
  const hit = d.results?.[0];
  if (!hit) return null;
  return { name: hit.name, country: hit.country, lat: hit.latitude, lon: hit.longitude };
}

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  return openMeteoProvider.getForecast(lat, lon);
}

export interface EventWeather {
  available: boolean;
  temp: number | null;
  precipProb: number | null;
  code: number | null;
  label: string;
  place: string | null;
  note?: string;
}

/** Weather at a place + datetime, for calendar events. */
export async function weatherForEvent(
  location: string,
  datetime: string // "YYYY-MM-DD HH:mm"
): Promise<EventWeather> {
  const place = await geocode(location);
  if (!place) return { available: false, temp: null, precipProb: null, code: null, label: "", place: null, note: "Location not found" };

  const forecast = await getForecast(place.lat, place.lon);
  const iso = datetime.replace(" ", "T");
  const date = datetime.slice(0, 10);
  const hour = datetime.slice(11, 16);

  const slot = forecast.hourly.find((h) => h.time.startsWith(iso.slice(0, 13)));
  if (slot) {
    return {
      available: true,
      temp: slot.temp,
      precipProb: slot.precipProb,
      code: slot.code,
      label: `at ${hour}`,
      place: `${place.name}, ${place.country}`,
    };
  }

  const day = forecast.daily.find((d) => d.date === date);
  if (day) {
    return {
      available: true,
      temp: Math.round(((day.min + day.max) / 2) * 10) / 10,
      precipProb: day.precipProb,
      code: day.code,
      label: "daily avg",
      place: `${place.name}, ${place.country}`,
      note: "Forecast beyond hourly range",
    };
  }

  return { available: false, temp: null, precipProb: null, code: null, label: "", place: null, note: "Date outside forecast range (7 days)" };
}
