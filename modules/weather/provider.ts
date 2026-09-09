// Weather provider abstraction. Implementations fetch a common Forecast shape.

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

export interface WeatherProvider {
  name: string;
  getForecast(lat: number, lon: number): Promise<Forecast>;
}

// WMO weather interpretation codes (shared by Open-Meteo; AEMET needs its own mapping)
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
