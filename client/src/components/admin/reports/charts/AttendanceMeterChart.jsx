// ─── AttendanceMeterChart.jsx ─────────────────────────────────────────────────
// Global attendance health for the selected period: what share of marked
// lessons were attended vs. missed. Backed by GET /api/admin/reports/attendance-summary.
// This is a single ratio against a limit (attendance rate out of 100%), so per
// the dataviz skill's form guidance it's a meter, not a 2-slice pie: the fill
// carries the rate in the app's existing "good" status color (#15803d, already
// used for positive deltas in Financials), the unfilled track is a lighter step
// of the same green so state reads across the whole bar. Present/absent counts
// underneath are real states, so they're status chips with icon + label — same
// convention as the drop-off chips in PaymentFunnelChart — never color alone.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import styles from "./AttendanceMeterChart.module.css";

function AttendanceMeterChart({ startDate, endDate }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/admin/reports/attendance-summary?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res);
      })
      .catch(() => {
        // non-blocking: chart just keeps showing its empty state
      });
  }, [startDate, endDate]);

  const hasData = data && data.total > 0;
  const ratePct = hasData ? Math.round(data.attendance_rate_pct) : null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.title}>Attendance Rate</h2>
          <span className={styles.period}>Selected period &middot; all courses</span>
        </div>
      </div>

      <div className={styles.body}>
        {!data ? (
          <div className={styles.loading}>Loading…</div>
        ) : !hasData ? (
          <div className={styles.loading}>No attendance marked in this period</div>
        ) : (
          <>
            <div className={styles.rateRow}>
              <span className={styles.rateValue}>{ratePct}%</span>
              <span className={styles.rateLabel}>of marked lessons attended</span>
            </div>

            <div
              className={styles.meterTrack}
              role="progressbar"
              aria-valuenow={ratePct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={styles.meterFill} style={{ width: `${ratePct}%` }} />
            </div>

            <div className={styles.chips}>
              <div className={`${styles.chip} ${styles.chipPresent}`}>
                <CheckCircle2 size={14} />
                <span>{data.present} present</span>
              </div>
              <div className={`${styles.chip} ${styles.chipAbsent}`}>
                <XCircle size={14} />
                <span>{data.absent} absent</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AttendanceMeterChart;
