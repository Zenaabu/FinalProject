// ─── SeasonalityChart.jsx ─────────────────────────────────────────────────────
// Which time of year we register the most students — backed by
// GET /api/admin/reports/registrations-by-month, summed across every year the
// selected range spans so a wide range (e.g. a full year or more) surfaces the
// seasonal pattern rather than a one-off month. Comparing magnitude across an
// already-ordered axis (Jan..Dec) is a sequential-color job per the dataviz
// skill, but the actual question the admin is asking is "which period wins" —
// so this uses emphasis: every month in the same validated light-blue ordinal
// step (#38bdf8), with the peak month(s) promoted to the dark step of that same
// ramp (#075985), same two hues already validated for RevenueByLevelChart.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import styles from "./SeasonalityChart.module.css";

const BASE_COLOR = "#38bdf8";
const PEAK_COLOR = "#075985";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{row.month_label}</div>
      <div className={styles.tooltipValue}>
        {row.registrations} registration{row.registrations === 1 ? "" : "s"}
      </div>
      {row.isPeak && <div className={styles.tooltipSub}>Peak month</div>}
    </div>
  );
}

function SeasonalityChart({ startDate, endDate }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/admin/reports/registrations-by-month?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) return;

        const months = res.months.map((m) => ({
          ...m,
          isPeak: res.peak_months.includes(m.month_num),
        }));

        const peakLabels = months.filter((m) => m.isPeak).map((m) => m.month_label);

        setData({ months, peakLabels });
      })
      .catch(() => {
        // non-blocking: chart just keeps showing its empty state
      });
  }, [startDate, endDate]);

  const hasData = data && data.months.some((m) => m.registrations > 0);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.title}>Busiest Time of Year</h2>
          <span className={styles.period}>Selected period &middot; registrations by month</span>
        </div>
        {hasData && data.peakLabels.length > 0 && (
          <div className={styles.peakBadge}>
            Peak: {data.peakLabels.join(", ")}
          </div>
        )}
      </div>

      <div className={styles.chartWrap}>
        {data ? (
          hasData ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.months} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month_label"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} />
                <Bar dataKey="registrations" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {data.months.map((m) => (
                    <Cell key={m.month_num} fill={m.isPeak ? PEAK_COLOR : BASE_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.loading}>No registrations in this period</div>
          )
        ) : (
          <div className={styles.loading}>Loading…</div>
        )}
      </div>
    </div>
  );
}

export default SeasonalityChart;
