import type { Forecast } from "../provider";

export const openMeteoProvider = {
  name: "openmeteo",

  async getForecast(lat: number, lon: number): Promise<Forecast> {
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
  },
};
