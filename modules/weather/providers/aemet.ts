import type { Forecast, WeatherProvider } from "../provider";

// ponytail: AEMET stub — their API returns per-municipality documents that need
// nontrivial parsing; Open-Meteo covers the MVP. To enable: parse AEMET's
// daily/hourly prediction responses into the Forecast shape here and set
// WEATHER_PROVIDER=aemet with AEMET_API_KEY in .env.
export const aemetProvider: WeatherProvider = {
  name: "aemet",
  async getForecast(): Promise<Forecast> {
    throw new Error("AEMET provider is not implemented yet; set WEATHER_PROVIDER=openmeteo");
  },
};
