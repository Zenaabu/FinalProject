// ─── GenderSplitChart.jsx ─────────────────────────────────────────────────────
// Who our customers are: male vs. female, among everyone who registered for a
// course in the selected period. Backed by GET /api/admin/reports/gender-distribution.
// Two nominal categories -> identity color, not magnitude, so each gender gets
// its own fixed hue rather than a step on one ramp: ocean blue (already the
// app's primary brand color) for male, the existing purple accent (already used
// for VAT in Financials) for female. Validated as a categorical pair with the
// dataviz skill's palette validator: worst-pair CVD ΔE 9.2 (deutan), normal-vision
// ΔE 19.8 — clears both the 8/15 targets on the app's white card surface.
// Horizontal bars (same layout as PaymentHealthChart) read gender counts more
// directly than a 2-slice donut would.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList, ResponsiveContainer } from "recharts";
import styles from "./GenderSplitChart.module.css";

const GENDER_COLORS = { female: "#7c3aed", male: "#0284c7" };
const GENDER_LABELS = { female: "Female", male: "Male" };

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{row.label}</div>
      <div className={styles.tooltipValue}>
        {row.user_count} customer{row.user_count === 1 ? "" : "s"}
      </div>
      <div className={styles.tooltipSub}>{row.pct}% of total</div>
    </div>
  );
}

// The label text is read from the bar's own `value` (the row's precomputed
// `count_label`), not looked up via `index` — recharts 3 doesn't reliably pass
// the row index to custom label content, which mislabeled bars.
function renderCountLabel({ x, y, width, height, value }) {
  if (value == null) return null;

  return (
    <text
      x={Number(x) + Number(width) + 10}
      y={Number(y) + Number(height) / 2}
      textAnchor="start"
      dominantBaseline="middle"
      className={styles.labelCount}
    >
      {value}
    </text>
  );
}

function GenderSplitChart({ startDate, endDate }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/admin/reports/gender-distribution?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) return;

        const total = res.genders.reduce((sum, g) => sum + Number(g.user_count), 0);
        const genders = res.genders.map((g) => {
          const user_count = Number(g.user_count);
          const pct = total > 0 ? Math.round((user_count / total) * 100) : 0;
          return {
            ...g,
            user_count,
            label: GENDER_LABELS[g.gender],
            pct,
            count_label: `${user_count} (${pct}%)`,
          };
        });

        setData({ genders, total });
      })
      .catch(() => {
        // non-blocking: chart just keeps showing its empty state
      });
  }, [startDate, endDate]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.title}>Who Our Customers Are</h2>
          <span className={styles.period}>Selected period &middot; by gender</span>
        </div>
        {data && (
          <div className={styles.totalBox}>
            <span className={styles.totalValue}>{data.total}</span>
            <span className={styles.totalLabel}>total</span>
          </div>
        )}
      </div>

      <div className={styles.chartWrap}>
        {data ? (
          data.total > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={data.genders}
                layout="vertical"
                margin={{ top: 4, right: 64, left: 4, bottom: 0 }}
                barCategoryGap="35%"
              >
                <XAxis type="number" hide domain={[0, (max) => Math.ceil(max * 1.2)]} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 14, fontWeight: 600, fill: "#0f172a" }}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} />
                <Bar dataKey="user_count" radius={[0, 4, 4, 0]} maxBarSize={34}>
                  {data.genders.map((g) => (
                    <Cell key={g.gender} fill={GENDER_COLORS[g.gender]} />
                  ))}
                  <LabelList dataKey="count_label" content={renderCountLabel} />
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

export default GenderSplitChart;
