import { useState } from "react";
import { LuWaves, LuWind, LuThermometer } from "react-icons/lu";
import "./WeatherWidget.css";

const ICON_COLOR = "#ffffff";
const ICON_SIZE = 28;

function WeatherWidget() {
  const [waveHeight] = useState(1.2);
  const [windSpeed] = useState(15);
  const [temperature] = useState(28);
  const [recommendation] = useState(
    "Perfect clean conditions for Beginners today! Small clean waves — come surf.",
  );

  return (
    <div className="weather-widget">
      {/* ── Top: Smart Recommendation ── */}
      <div className="weather-widget__recommendation">
        <h3 className="weather-widget__rec-title">
          ✨ Smart Surf Recommendation
        </h3>
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
    </div>
  );
}

export default WeatherWidget;
