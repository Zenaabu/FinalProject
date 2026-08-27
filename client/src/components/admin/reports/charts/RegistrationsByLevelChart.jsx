// ─── RegistrationsByLevelChart.jsx ────────────────────────────────────────────
// How registrations split across course levels, backed by
// GET /api/admin/reports/registrations-by-level. Same ordinal treatment as
// Financials' RevenueByLevelChart: level is a tier (beginner < intermediate <
// advanced), not a ranking, so one hue with monotone lightness steps, always
// shown in tier order. Same validated ramp: #38bdf8 -> #0284c7 -> #075985.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import styles from "./RegistrationsByLevelChart.module.css";

const LEVEL_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const LEVEL_COLORS = {
  beginner: "#38bdf8",
  intermediate: "#0284c7",
  advanced: "#075985",
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{LEVEL_LABELS[row.level]}</div>
      <div className={styles.tooltipValue}>
        {row.registrations} registration{row.registrations === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function RegistrationsByLevelChart({ startDate, endDate }) {
  const [levels, setLevels] = useState(null);

  useEffect(() => {
    setLevels(null);
    fetch(`/api/admin/reports/registrations-by-level?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLevels(data.levels);
      })
      .catch(() => {
        // non-blocking: chart just keeps showing its empty state
      });
  }, [startDate, endDate]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Registrations by Level</h2>
        <span className={styles.period}>Selected period</span>
      </div>

      <div className={styles.chartWrap}>
        {levels ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={levels} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="level"
                tickFormatter={(l) => LEVEL_LABELS[l]}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={32}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} />
              <Bar dataKey="registrations" radius={[4, 4, 0, 0]} maxBarSize={64}>
                {levels.map((l) => (
                  <Cell key={l.level} fill={LEVEL_COLORS[l.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.loading}>Loading…</div>
        )}
      </div>
    </div>
  );
}

export default RegistrationsByLevelChart;
