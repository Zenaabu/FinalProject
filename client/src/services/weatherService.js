// ─── weatherService.js ────────────────────────────────────────────────────────
// Fetches live weather + marine data from Open-Meteo (no API key required).
// Location: Haifa, Israel (lat: 32.813, lon: 34.9993)
// ──────────────────────────────────────────────────────────────────────────────

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=32.813&longitude=34.9993&current=temperature_2m,wind_speed_10m,wind_direction_10m";

const MARINE_URL =
  "https://marine-api.open-meteo.com/v1/marine?latitude=32.813&longitude=34.9993&current=wave_height";

/**
 * Fetches current weather and marine conditions.
 * @returns {{ waveHeight: number, windSpeed: number, temperature: number }}
 */
export async function fetchCurrentWeather() {
  try {
    const [weatherRes, marineRes] = await Promise.all([
      fetch(WEATHER_URL),
      fetch(MARINE_URL),
    ]);

    if (!weatherRes.ok || !marineRes.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const [weatherData, marineData] = await Promise.all([
      weatherRes.json(),
      marineRes.json(),
    ]);

    return {
      temperature: weatherData.current.temperature_2m,
      windSpeed: weatherData.current.wind_speed_10m,
      waveHeight: marineData.current.wave_height,
    };
  } catch (error) {
    console.error("weatherService error:", error);
    throw error;
  }
}

/**
 * Returns a surf recommendation string based on conditions and user level.
 * @param {number} waveHeight  - in metres
 * @param {number} windSpeed   - in km/h
 * @param {string} userLevel   - "Beginner" | "Intermediate" | "Advanced"
 * @returns {string}
 */
export function getSurfRecommendation(waveHeight, windSpeed, userLevel) {
  if (waveHeight > 2.0 || windSpeed >= 25) {
    return "Advanced surfers only! High waves and strong winds.";
  }

  if (waveHeight > 1.2 && waveHeight <= 2.0) {
    return "Intermediate to Advanced conditions. Solid waves with some power.";
  }

  if (waveHeight > 0.6 && waveHeight <= 1.2) {
    if (userLevel === "Beginner") {
      return "Perfect clean conditions for Beginners today! Small clean waves — come surf.";
    }
    return "Good conditions for all levels. Fun, manageable waves.";
  }

  // waveHeight <= 0.6
  return "Very small surf today. Great for paddling practice or beginners building confidence.";
}
