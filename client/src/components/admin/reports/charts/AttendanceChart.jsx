// ─── AttendanceChart.jsx ──────────────────────────────────────────────────────
// Global attendance health for the selected period: how many marked lessons
// were attended vs. missed. Backed by GET /api/admin/reports/attendance-summary.
// Two real states -> the app's existing status colors (good green #15803d /
// critical red #dc2626), each its own bar so admins can compare the raw counts
// directly, same horizontal-bar layout as GenderSplitChart. The headline rate
// number is a simple health signal on top: green when at least half of marked
// lessons were attended, red when attendance is below that line.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList, ResponsiveContainer } from "recharts";
import styles from "./AttendanceChart.module.css";

const STATUS_COLORS = { present: "#15803d", absent: "#dc2626" };

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{row.label}</div>
      <div className={styles.tooltipValue}>
        {row.count} lesson{row.count === 1 ? "" : "s"}
      </div>
      <div className={styles.tooltipSub}>{row.pct}% of marked lessons</div>
    </div>
  );
}

function renderCountLabel({ x, y, width, height, index, data }) {
  const row = data[index];
  if (!row) return null;

  return (
    <text
      x={x + width + 10}
      y={y + height / 2}
      textAnchor="start"
      dominantBaseline="middle"
      className={styles.labelCount}
    >
      {row.count} ({row.pct}%)
    </text>
  );
}

function AttendanceChart({ startDate, endDate }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/admin/reports/attendance-summary?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) return;

        const total = res.total;
        const bars = [
          {
            status: "present",
            label: "Present",
            count: res.present,
            pct: total > 0 ? Math.round((res.present / total) * 100) : 0,
          },
          {
            status: "absent",
            label: "Absent",
            count: res.absent,
            pct: total > 0 ? Math.round((res.absent / total) * 100) : 0,
          },
        ];

        setData({ bars, total, ratePct: res.attendance_rate_pct });
      })
      .catch(() => {
        // non-blocking: chart just keeps showing its empty state
      });
  }, [startDate, endDate]);

  const hasData = data && data.total > 0;
  const ratePct = hasData ? Math.round(data.ratePct) : null;
  const isHealthy = hasData && ratePct >= 50;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.title}>Attendance Rate</h2>
          <span className={styles.period}>Selected period &middot; all courses</span>
        </div>
        {hasData && (
          <div className={styles.rateBox}>
            <span
              className={styles.rateValue}
              style={{ color: isHealthy ? "#15803d" : "#dc2626" }}
            >
              {ratePct}%
            </span>
            <span className={styles.rateLabel}>attended</span>
          </div>
        )}
      </div>

      <div className={styles.chartWrap}>
        {data ? (
          hasData ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={data.bars}
                layout="vertical"
                margin={{ top: 4, right: 64, left: 4, bottom: 0 }}
                barCategoryGap="35%"
              >
                <XAxis type="number" hide domain={[0, (max) => Math.max(1, Math.ceil(max * 1.2))]} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#334155" }}
                  axisLine={false}
                  tickLine={false}
                  width={54}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={34}>
                  {data.bars.map((b) => (
                    <Cell key={b.status} fill={STATUS_COLORS[b.status]} />
                  ))}
                  <LabelList content={(props) => renderCountLabel({ ...props, data: data.bars })} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.loading}>No attendance marked in this period</div>
          )
        ) : (
          <div className={styles.loading}>Loading…</div>
        )}
      </div>
    </div>
  );
}

export default AttendanceChart;
