// ─── RevenueByLevelChart.jsx ──────────────────────────────────────────────────
// Revenue per course level (excl. VAT), backed by GET /api/admin/financials/revenue-by-level.
// Level is a tier (beginner < intermediate < advanced), not a ranking, so this
// is an ordinal chart: one hue, monotone lightness steps that read as
// progression, always shown in tier order rather than sorted by value.
// Ramp validated with the dataviz skill's palette validator (--ordinal):
// #38bdf8 -> #0284c7 -> #075985 passes lightness/contrast/hue-spread checks.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import styles from "./RevenueByLevelChart.module.css";

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

function formatCurrency(value) {
  return `₪${Math.round(Number(value)).toLocaleString("en-US")}`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{LEVEL_LABELS[row.level]}</div>
      <div className={styles.tooltipValue}>{formatCurrency(row.revenue)}</div>
    </div>
  );
}

function RevenueByLevelChart({ startDate, endDate }) {
  const [levels, setLevels] = useState(null);

  useEffect(() => {
    setLevels(null);
    fetch(
      `/api/admin/financials/revenue-by-level?startDate=${startDate}&endDate=${endDate}`,
    )
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
      {/* ── Card header ───────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Revenue by Level</h2>
        <span className={styles.period}>Selected period, excl. VAT</span>
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────── */}
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
                width={52}
                tickFormatter={(v) => `₪${Math.round(v / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={64}>
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

export default RevenueByLevelChart;
