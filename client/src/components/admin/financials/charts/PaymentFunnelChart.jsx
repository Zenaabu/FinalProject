// ─── PaymentFunnelChart.jsx ───────────────────────────────────────────────────
// How PayPal checkouts resolve, backed by GET /api/admin/financials/payment-funnel.
// Three ordered stages, each a strict subset of the one before. Horizontal bar
// chart rather than a true funnel shape — reads more reliably at this size and
// scales cleanly, while a "-X%" label between bars keeps the step-by-step
// drop-off story. One hue, monotone lightness (same validated ramp as
// RevenueByLevelChart: #38bdf8 -> #0284c7 -> #075985). The three drop-off
// reasons underneath are real states (failed / abandoned / in progress), so
// those wear the app's status colors instead, each paired with an icon + label.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { XCircle, Clock, Timer } from "lucide-react";
import styles from "./PaymentFunnelChart.module.css";

const DAYS_WINDOW = 30;

const STAGE_COLORS = ["#38bdf8", "#0284c7", "#075985"];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{row.label}</div>
      <div className={styles.tooltipValue}>{row.count}</div>
      <div className={styles.tooltipSub}>{row.pct}% of checkouts started</div>
    </div>
  );
}

// count label anchored just past the end of each bar
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
      {row.count}
    </text>
  );
}

// "-X%" drop-off vs. the previous stage, sitting in the gap just above every
// bar except the first
function renderDropLabel({ x, y, index, data }) {
  const row = data[index];
  if (!row || index === 0) return null;

  const prev = data[index - 1];
  const drop = prev.count > 0 ? Math.round(((prev.count - row.count) / prev.count) * 100) : 0;
  if (drop <= 0) return null;

  return (
    <text
      x={x}
      y={y - 8}
      textAnchor="start"
      className={styles.labelDrop}
    >
      ↓ -{drop}%
    </text>
  );
}

function PaymentFunnelChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/financials/payment-funnel?days=${DAYS_WINDOW}`)
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) return;

        const started = res.funnel[0]?.count || 0;
        const funnel = res.funnel.map((stage) => ({
          ...stage,
          pct: started > 0 ? Math.round((stage.count / started) * 100) : 0,
        }));

        setData({
          funnel,
          breakdown: res.breakdown,
          conversionRate: res.conversion_rate,
        });
      })
      .catch(() => {
        // non-blocking: chart just keeps showing its empty state
      });
  }, []);

  return (
    <div className={styles.card}>
      {/* ── Card header ───────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.title}>Payment Funnel</h2>
          <span className={styles.period}>Last {DAYS_WINDOW} days &middot; PayPal checkouts</span>
        </div>
        {data?.conversionRate !== null && data?.conversionRate !== undefined && (
          <div className={styles.conversion}>
            <span className={styles.conversionValue}>
              {Math.round(data.conversionRate)}%
            </span>
            <span className={styles.conversionLabel}>conversion</span>
          </div>
        )}
      </div>

      {/* ── Funnel bars ───────────────────────────────────────────────── */}
      <div className={styles.chartWrap}>
        {data ? (
          data.funnel[0].count > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={data.funnel}
                  layout="vertical"
                  margin={{ top: 14, right: 44, left: 4, bottom: 0 }}
                  barCategoryGap="38%"
                >
                  <XAxis type="number" hide domain={[0, (max) => Math.ceil(max * 1.15)]} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#334155" }}
                    axisLine={false}
                    tickLine={false}
                    width={118}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={30}>
                    {data.funnel.map((entry, i) => (
                      <Cell key={entry.stage} fill={STAGE_COLORS[i]} />
                    ))}
                    <LabelList content={(props) => renderCountLabel({ ...props, data: data.funnel })} />
                    <LabelList content={(props) => renderDropLabel({ ...props, data: data.funnel })} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* ── Drop-off reasons ──────────────────────────────────── */}
              <div className={styles.breakdown}>
                <div className={`${styles.chip} ${styles.chipFailed}`}>
                  <XCircle size={14} />
                  <span>{data.breakdown.failed} failed</span>
                </div>
                <div className={`${styles.chip} ${styles.chipAbandoned}`}>
                  <Clock size={14} />
                  <span>{data.breakdown.abandoned} abandoned</span>
                </div>
                <div className={`${styles.chip} ${styles.chipProgress}`}>
                  <Timer size={14} />
                  <span>{data.breakdown.in_progress} in progress</span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.loading}>No checkouts started yet</div>
          )
        ) : (
          <div className={styles.loading}>Loading…</div>
        )}
      </div>
    </div>
  );
}

export default PaymentFunnelChart;
