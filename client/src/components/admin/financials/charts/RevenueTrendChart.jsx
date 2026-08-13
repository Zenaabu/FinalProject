// ─── RevenueTrendChart.jsx ────────────────────────────────────────────────────
// Daily revenue trend (excl. VAT) for the selected date range, backed by
// GET /api/admin/financials/revenue-trend. Used to show a fixed trailing
// 6-month view regardless of what the admin cared about; now it always
// tracks the same [startDate, endDate] window as the rest of the page (this
// month by default), so it reads as "this period, day by day" instead of a
// stale multi-month history.
// Single series over time -> area chart, one hue, direct tooltip on hover.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./RevenueTrendChart.module.css";

function formatCurrency(value) {
  return `₪${Math.round(Number(value)).toLocaleString("en-US")}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

function RevenueTrendChart({ startDate, endDate }) {
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    setTrend(null);
    fetch(
      `/api/admin/financials/revenue-trend?startDate=${startDate}&endDate=${endDate}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTrend(data.trend);
      })
      .catch(() => {
        // non-blocking: chart just keeps showing its empty state
      });
  }, [startDate, endDate]);

  // Recharts renders every tick by default — fine for a month (~30 points),
  // but a long custom range would overlap labels, so thin them out.
  const tickInterval =
    trend && trend.length > 31 ? Math.ceil(trend.length / 15) : 0;

  return (
    <div className={styles.card}>
      {/* ── Card header ───────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Revenue Trend</h2>
        <span className={styles.period}>Daily, excl. VAT</span>
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────── */}
      <div className={styles.chartWrap}>
        {trend ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day_label"
                interval={tickInterval}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(v) => `₪${Math.round(v / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#38bdf8", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0284c7"
                strokeWidth={2}
                fill="url(#revenueFill)"
                dot={trend.length <= 31 ? { r: 3.5, fill: "#fff", stroke: "#0284c7", strokeWidth: 2 } : false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.loading}>Loading…</div>
        )}
      </div>
    </div>
  );
}

export default RevenueTrendChart;
