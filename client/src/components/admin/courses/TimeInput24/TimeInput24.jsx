// ─── TimeInput24.jsx ──────────────────────────────────────────────────────────
// 24-hour time picker made of two dropdowns (hour 00–23, minute). Replaces
// <input type="time">, which shows an AM/PM picker on 12-hour locales. Here the
// AM/PM is implied by the hour: 08 is morning, 18 is evening.
//
// Props:
//   value    – "HH:MM" (24h; "HH:MM:SS" is tolerated) or ""
//   onChange – (value: string) => void; called with "HH:MM", or "" while no
//              hour is chosen. Picking an hour alone defaults minutes to "00".
//   id       – put on the hour select (so an external <label htmlFor> works)
//   className – applied to both selects

import { useEffect, useState } from "react";
import styles from "./TimeInput24.module.css";

const pad = (n) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const STEP_MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

const split = (v) => {
  const [h = "", m = ""] = (v || "").split(":");
  return { h, m: h ? m || "00" : "" };
};

export default function TimeInput24({ value, onChange, id, className }) {
  const [{ h, m }, setParts] = useState(() => split(value));

  // Sync when the parent changes the value from outside (e.g. form reset).
  useEffect(() => {
    const next = split(value);
    if (`${next.h}:${next.m}` !== `${h}:${m}` && (value || "") !== "") {
      setParts(next);
    } else if (!value && h) {
      // Parent cleared the value: only reset if we aren't mid-selection.
      // (We always emit a value once an hour is chosen, so this is a reset.)
      setParts({ h: "", m: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const update = (nextH, nextM) => {
    setParts({ h: nextH, m: nextM });
    onChange(nextH ? `${nextH}:${nextM || "00"}` : "");
  };

  // Keep an existing off-step minute (e.g. a lesson at 08:10 or 08:07) selectable.
  const minutes = m && !STEP_MINUTES.includes(m) ? [...STEP_MINUTES, m].sort() : STEP_MINUTES;

  return (
    <div className={styles.wrap}>
      <select
        id={id}
        className={className}
        value={h}
        onChange={(e) => update(e.target.value, m)}
        aria-label="Hour"
      >
        <option value="">HH</option>
        {HOURS.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
      <span className={styles.colon}>:</span>
      <select
        className={className}
        value={m}
        onChange={(e) => update(h, e.target.value)}
        disabled={!h}
        aria-label="Minute"
      >
        <option value="" hidden>
          MM
        </option>
        {minutes.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </div>
  );
}
