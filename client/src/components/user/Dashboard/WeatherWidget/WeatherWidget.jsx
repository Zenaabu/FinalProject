// ─── WeatherWidget.jsx ─────────────────────────────────────────────────────────
// Today's sea conditions, pulled from the existing GET /api/weather endpoint
// (server/routes/weather.js — already wraps Open-Meteo, so this stays a plain
// relative fetch rather than duplicating that call in the browser).
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Waves, Wind, Thermometer, ClipboardList, MapPin } from "lucide-react";
import styles from "./WeatherWidget.module.css";

const ICON_SIZE = 28;
const USER_LEVEL = "Beginner"; // TODO: read from the user's profile once course level is tracked per user

// a function that gets wave height (m), wind speed (km/h) and a surf level
// it returns a { status, message } pair — status drives the widget's color
// (see WeatherWidget.module.css for the palette each status maps to)
function getSurfRecommendation(waveHeight, windSpeed, userLevel) {
  if (waveHeight == null) {
    return {
      status: "unavailable",
      message:
        "Wave data is unavailable right now — check conditions before heading out.",
    };
  }

  if (waveHeight > 2.0 || windSpeed >= 25) {
    return {
      status: "extreme",
      message: "Advanced surfers only! High waves and strong winds.",
    };
  }

  if (waveHeight > 1.2) {
    return {
      status: "intermediate",
      message: "Intermediate to Advanced conditions. Solid waves with some power.",
    };
  }

  if (waveHeight > 0.6) {
    return {
      status: "clean",
      message:
        userLevel === "Beginner"
          ? "Perfect clean conditions for Beginners today! Small clean waves — come surf."
          : "Good conditions for all levels. Fun, manageable waves.",
    };
  }

  return {
    status: "calm",
    message:
      "Very small surf today. Great for paddling practice or beginners building confidence.",
  };
}

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load weather data");
        }
        setWeather(data.weather);
      })
      .catch(() => setError("Could not load weather data. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={`${styles.widget} ${styles.unavailable} ${styles.state}`}>
        <p className={styles.stateText}>Loading weather data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.widget} ${styles.unavailable} ${styles.state}`}>
        <p className={styles.stateText}>{error}</p>
      </div>
    );
  }

  const { status, message } = getSurfRecommendation(
    weather.waveHeight,
    weather.windSpeed,
    USER_LEVEL,
  );

  return (
    <div className={`${styles.widget} ${styles[status]}`}>
      {/* ── Top: Smart Recommendation ── */}
      <div className={styles.recommendation}>
        <div className={styles.recHeader}>
          <ClipboardList size={18} color="#ffffff" />
          <h3 className={styles.recTitle}>
            Today's Surf Recommendation — Live Update
          </h3>
        </div>
        <p className={styles.recText}>{message}</p>
      </div>

      {/* ── Bottom: Data Row ── */}
      <div className={styles.dataRow}>
        <div className={styles.statBox}>
          <Waves size={ICON_SIZE} color="#ffffff" />
          <span className={styles.value}>
            {weather.waveHeight != null ? `${weather.waveHeight} m` : "—"}
          </span>
          <span className={styles.label}>Wave Height</span>
        </div>

        <div className={styles.statBox}>
          <Wind size={ICON_SIZE} color="#ffffff" />
          <span className={styles.value}>{weather.windSpeed} km/h</span>
          <span className={styles.label}>Wind Speed</span>
        </div>

        <div className={styles.statBox}>
          <Thermometer size={ICON_SIZE} color="#ffffff" />
          <span className={styles.value}>{weather.temperature}°C</span>
          <span className={styles.label}>Temperature</span>
        </div>
      </div>

      {/* ── Footer: Location ── */}
      <div className={styles.location}>
        <MapPin size={13} color="rgba(255,255,255,0.75)" />
        <span>Haifa Beaches — Conditions update daily</span>
      </div>
    </div>
  );
}

export default WeatherWidget;
