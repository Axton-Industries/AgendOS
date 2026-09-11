import { cached } from "@/lib/cache";

export interface Forecast {
  current: {
    temp: number;
    feelsLike: number;
    code: number;
    precipProb: number | null;
    precip: number | null;
    wind: number | null;
    humidity: number | null;
  };
  /** local ISO times: "2026-09-14T09:00" */
  hourly: { time: string; temp: number; precipProb: number | null; precip: number | null; code: number }[];
  daily: {
    date: string; min: number; max: number; code: number;
    precipProb: number | null; precip: number | null;
  }[];
}

// WMO weather interpretation codes (Open-Meteo uses them directly)
export const WMO_LABELS: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
  56: "Light freezing drizzle", 57: "Freezing drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Light freezing rain", 67: "Freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Light showers", 81: "Showers", 82: "Violent showers",
  85: "Snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Heavy thunderstorm with hail",
};

export function wmoLabel(code: number) {
  return WMO_LABELS[code] ?? "Unknown";
}

export interface GeoPlace {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export async function geocode(query: string): Promise<GeoPlace | null> {
  const q = query.trim().toLowerCase();
  return cached(`geocode:${q}`, 30 * 86400, () => geocodeRemote(q)); // geocode results don't change
}

async function geocodeRemote(query: string): Promise<GeoPlace | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  );
  if (!res.ok) throw new Error("Geocoding request failed");
  const d = await res.json();
  const hit = d.results?.[0];
  if (!hit) return null;
  return { name: hit.name, country: hit.country, lat: hit.latitude, lon: hit.longitude };
}

export function getForecast(lat: number, lon: number): Promise<Forecast> {
  return cached(`forecast:${lat},${lon}`, 600, () => fetchForecast(lat, lon));
}

async function fetchForecast(lat: number, lon: number): Promise<Forecast> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&hourly=temperature_2m,precipitation_probability,precipitation,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum` +
    `&forecast_days=7&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo request failed (${res.status})`);
  const d = await res.json();

  return {
    current: {
      temp: d.current.temperature_2m,
      feelsLike: d.current.apparent_temperature,
      code: d.current.weather_code,
      precipProb: null,
      precip: d.current.precipitation,
      wind: d.current.wind_speed_10m,
      humidity: d.current.relative_humidity_2m,
    },
    hourly: d.hourly.time.map((time: string, i: number) => ({
      time,
      temp: d.hourly.temperature_2m[i],
      precipProb: d.hourly.precipitation_probability[i],
      precip: d.hourly.precipitation[i],
      code: d.hourly.weather_code[i],
    })),
    daily: d.daily.time.map((date: string, i: number) => ({
      date,
      min: d.daily.temperature_2m_min[i],
      max: d.daily.temperature_2m_max[i],
      code: d.daily.weather_code[i],
      precipProb: d.daily.precipitation_probability_max[i],
      precip: d.daily.precipitation_sum[i],
    })),
  };
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