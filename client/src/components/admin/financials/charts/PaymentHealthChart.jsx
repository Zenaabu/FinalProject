// ─── PaymentHealthChart.jsx ───────────────────────────────────────────────────
// Is checkout actually working? Backed by GET /api/admin/financials/payment-health.
// Was a 3-stage "funnel" (started -> reached payment -> approved) with a
// separate drop-off breakdown — admin feedback was that it was hard to read
// at a glance. Replaced with just two bars: Approved vs. Not Approved, so the
// first thing you see answers "is something wrong with payments right now".
// The three reasons behind "Not Approved" (failed / abandoned / in progress)
// stay as chips underneath — that's what tells the admin whether a spike is
// an actual problem (failed = something broke, e.g. PayPal/API trouble) or
// not (abandoned = a customer just didn't finish; in progress = still being
// completed as of this moment, not stuck).
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
import styles from "./PaymentHealthChart.module.css";

const STATUS_COLORS = { approved: "#16a34a", not_approved: "#dc2626" };

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

function PaymentHealthChart({ startDate, endDate }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    fetch(
      `/api/admin/financials/payment-health?startDate=${startDate}&endDate=${endDate}`,
    )
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) return;

        const started = res.health.reduce((sum, row) => sum + row.count, 0);
        const health = res.health.map((row) => ({
          ...row,
          pct: started > 0 ? Math.round((row.count / started) * 100) : 0,
        }));

        setData({
          health,
          breakdown: res.breakdown,
          approvalRate: res.approval_rate,
        });
      })
      .catch(() => {
        // non-blocking: chart just keeps showing its empty state
      });
  }, [startDate, endDate]);

  const started = data ? data.health.reduce((sum, row) => sum + row.count, 0) : 0;

  return (
    <div className={styles.card}>
      {/* ── Card header ───────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.title}>Payment Health</h2>
          <span className={styles.period}>Selected period &middot; PayPal checkouts</span>
        </div>
        {data?.approvalRate !== null && data?.approvalRate !== undefined && (
          <div className={styles.approval}>
            <span className={styles.approvalValue}>
              {Math.round(data.approvalRate)}%
            </span>
            <span className={styles.approvalLabel}>approved</span>
          </div>
        )}
      </div>

      {/* ── Approved vs. Not Approved ────────────────────────────────── */}
      <div className={styles.chartWrap}>
        {data ? (
          started > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart
                  data={data.health}
                  layout="vertical"
                  margin={{ top: 4, right: 44, left: 4, bottom: 0 }}
                  barCategoryGap="38%"
                >
                  <XAxis type="number" hide domain={[0, (max) => Math.ceil(max * 1.15)]} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#334155" }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={36}>
                    {data.health.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                    ))}
                    <LabelList content={(props) => renderCountLabel({ ...props, data: data.health })} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* ── Why "Not Approved"? ───────────────────────────────── */}
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

export default PaymentHealthChart;
