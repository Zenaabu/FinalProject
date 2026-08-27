// ─── InstructorLoyaltyChart.jsx ───────────────────────────────────────────────
// Which instructors students keep coming back to — backed by
// GET /api/admin/reports/instructor-loyalty. A student's first-ever booking
// with an instructor never counts (everyone starts at 1, it says nothing about
// the instructor); only 2nd-or-later bookings with the same instructor do, so
// this ranks real repeat behavior. Every instructor is included, even at 0 —
// same "always show the full set" convention as RegistrationsByLevelChart —
// so an instructor with no repeats yet reads as "zero so far" instead of just
// vanishing from the list. Nominal ranking (instructor identity), one series
// -> a single flat hue per the dataviz skill's "color follows the entity,
// never its rank" rule, not a gradient by position. Horizontal bars, same
// layout as PaymentFunnelChart, sized to the row count.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import { Award } from "lucide-react";
import styles from "./InstructorLoyaltyChart.module.css";

const BAR_COLOR = "#0284c7";
const ROW_HEIGHT = 38;

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{row.instructor_name}</div>
      <div className={styles.tooltipValue}>
        {row.repeat_count} repeat booking{row.repeat_count === 1 ? "" : "s"}
      </div>
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
      {row.repeat_count}
    </text>
  );
}

function InstructorLoyaltyChart({ startDate, endDate }) {
  const [instructors, setInstructors] = useState(null);

  useEffect(() => {
    setInstructors(null);
    fetch(`/api/admin/reports/instructor-loyalty?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInstructors(data.instructors);
      })
      .catch(() => {
        // non-blocking: chart just keeps showing its empty state
      });
  }, [startDate, endDate]);

  const topInstructor =
    instructors && instructors.length > 0 && instructors[0].repeat_count > 0
      ? instructors[0]
      : null;
  const chartHeight = instructors ? Math.max(instructors.length * ROW_HEIGHT, ROW_HEIGHT) : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.title}>Instructor Loyalty</h2>
          <span className={styles.period}>
            Selected period &middot; students rebooking the same instructor
          </span>
        </div>
        {topInstructor && (
          <div className={styles.topBadge}>
            <Award size={14} />
            <span>{topInstructor.instructor_name}</span>
          </div>
        )}
      </div>

      <div className={styles.chartWrap}>
        {instructors ? (
          instructors.length > 0 ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={instructors}
                layout="vertical"
                margin={{ top: 4, right: 44, left: 4, bottom: 0 }}
                barCategoryGap="30%"
              >
                <XAxis
                  type="number"
                  hide
                  domain={[0, (max) => Math.max(1, Math.ceil(max * 1.15))]}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="instructor_name"
                  tick={{ fontSize: 12, fill: "#334155" }}
                  axisLine={false}
                  tickLine={false}
                  width={130}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} />
                <Bar dataKey="repeat_count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} maxBarSize={22}>
                  <LabelList content={(props) => renderCountLabel({ ...props, data: instructors })} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.loading}>No instructors yet</div>
          )
        ) : (
          <div className={styles.loading}>Loading…</div>
        )}
      </div>
    </div>
  );
}

export default InstructorLoyaltyChart;
