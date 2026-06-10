import { useState, useEffect } from "react";
import {
  LuWaves,
  LuWind,
  LuThermometer,
  LuClipboardList,
  LuMapPin,
} from "react-icons/lu";
import {
  fetchCurrentWeather,
  getSurfRecommendation,
} from "../../../../services/weatherService";
import "./WeatherWidget.css";

const ICON_COLOR = "#ffffff";
const ICON_SIZE = 28;
const USER_LEVEL = "Beginner";

function WeatherWidget() {
  const [waveHeight, setWaveHeight] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurrentWeather()
      .then((data) => {
        setWaveHeight(data.waveHeight);
        setWindSpeed(data.windSpeed);
        setTemperature(data.temperature);
        setRecommendation(
          getSurfRecommendation(data.waveHeight, data.windSpeed, USER_LEVEL),
        );
      })
      .catch(() => setError("Could not load weather data. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="weather-widget weather-widget--loading">
        <p className="weather-widget__loading-text">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget weather-widget--error">
        <p className="weather-widget__error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      {/* ── Top: Smart Recommendation ── */}
      <div className="weather-widget__recommendation">
        <div className="weather-widget__rec-header">
          <LuClipboardList size={18} color="#ffffff" />
          <h3 className="weather-widget__rec-title">
            Today's Surf Recommendation — Live Update
          </h3>
        </div>
        <p className="weather-widget__rec-text">{recommendation}</p>
      </div>

      {/* ── Bottom: Data Row ── */}
      <div className="weather-widget__data-row">
        <div className="weather-widget__stat-box">
          <LuWaves size={ICON_SIZE} color={ICON_COLOR} />
          <span className="weather-widget__value">{waveHeight} m</span>
          <span className="weather-widget__label">Wave Height</span>
        </div>

        <div className="weather-widget__stat-box">
          <LuWind size={ICON_SIZE} color={ICON_COLOR} />
          <span className="weather-widget__value">{windSpeed} km/h</span>
          <span className="weather-widget__label">Wind Speed</span>
        </div>

        <div className="weather-widget__stat-box">
          <LuThermometer size={ICON_SIZE} color={ICON_COLOR} />
          <span className="weather-widget__value">{temperature}°C</span>
          <span className="weather-widget__label">Temperature</span>
        </div>
      </div>

      {/* ── Footer: Location ── */}
      <div className="weather-widget__location">
        <LuMapPin size={13} color="rgba(255,255,255,0.75)" />
        <span>Haifa Beaches — Conditions update daily</span>
      </div>
    </div>
  );
}

export default WeatherWidget;
