// ─── ReportsPage.jsx ──────────────────────────────────────────────────────────
// Root page for /admin/reports. Owns the selected date range (defaults to the
// current month, same as FinancialsPage.jsx) and passes it down to every
// section — none of the charts show stale all-time numbers by default.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import ReportsKpiRow from "./kpis/ReportsKpiRow";
import ReportsDateRangeForm from "./dateRange/ReportsDateRangeForm";
import GenderSplitChart from "./charts/GenderSplitChart";
import AttendanceChart from "./charts/AttendanceChart";
import SeasonalityChart from "./charts/SeasonalityChart";
import InstructorLoyaltyChart from "./charts/InstructorLoyaltyChart";
import RegistrationsByLevelChart from "./charts/RegistrationsByLevelChart";
import styles from "./ReportsPage.module.css";

function toDateOnly(d) {
  return d.toISOString().slice(0, 10);
}

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { startDate: toDateOnly(start), endDate: toDateOnly(now) };
}

function formatRangeLabel(startDate, endDate) {
  const opts = { day: "numeric", month: "short", year: "numeric" };
  const start = new Date(`${startDate}T00:00:00`).toLocaleDateString("en-GB", opts);
  if (startDate === endDate) return start;
  const end = new Date(`${endDate}T00:00:00`).toLocaleDateString("en-GB", opts);
  return `${start} – ${end}`;
}

function ReportsPage() {
  const [range, setRange] = useState(currentMonthRange);

  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Reports &amp; Analytics</h1>
        <p className={styles.subtitle}>
          Showing {formatRangeLabel(range.startDate, range.endDate)} &middot; Who our
          customers are and how the club is performing
        </p>
      </div>

      {/* ── Date-range search ────────────────────────────────────────── */}
      <ReportsDateRangeForm
        startDate={range.startDate}
        endDate={range.endDate}
        onApply={(startDate, endDate) => setRange({ startDate, endDate })}
      />

      {/* ── KPI row ───────────────────────────────────────────────────── */}
      <ReportsKpiRow startDate={range.startDate} endDate={range.endDate} />

      {/* ── Crowd row: gender split + attendance rate ────────────────── */}
      <div className={styles.crowdRow}>
        <GenderSplitChart startDate={range.startDate} endDate={range.endDate} />
        <AttendanceChart startDate={range.startDate} endDate={range.endDate} />
      </div>

      {/* ── Seasonality ───────────────────────────────────────────────── */}
      <SeasonalityChart startDate={range.startDate} endDate={range.endDate} />

      {/* ── Breakdown row: instructor loyalty (wide) + by level (narrow) ─ */}
      <div className={styles.breakdownRow}>
        <InstructorLoyaltyChart startDate={range.startDate} endDate={range.endDate} />
        <RegistrationsByLevelChart startDate={range.startDate} endDate={range.endDate} />
      </div>
    </div>
  );
}

export default ReportsPage;
