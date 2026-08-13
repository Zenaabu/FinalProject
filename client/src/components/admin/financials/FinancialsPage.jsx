// ─── FinancialsPage.jsx ───────────────────────────────────────────────────────
// Root page for /admin/financials. Owns the selected date range (defaults to
// the current month) and passes it down to every section, since the school's
// financials only matter for a specific period the admin controls — none of
// the sections show stale all-time/last-6-months numbers by default anymore.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import FinancialsKpiRow from "./kpis/FinancialsKpiRow";
import RevenueTrendChart from "./charts/RevenueTrendChart";
import PaymentFunnelChart from "./charts/PaymentFunnelChart";
import RevenueByLevelChart from "./charts/RevenueByLevelChart";
import FinancialsDateRangeForm from "./dateRange/FinancialsDateRangeForm";
import styles from "./FinancialsPage.module.css";

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
  const start = new Date(`${startDate}T00:00:00`).toLocaleDateString(
    "en-GB",
    opts,
  );
  if (startDate === endDate) return start;
  const end = new Date(`${endDate}T00:00:00`).toLocaleDateString(
    "en-GB",
    opts,
  );
  return `${start} – ${end}`;
}

function FinancialsPage() {
  const [range, setRange] = useState(currentMonthRange);

  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Financials</h1>
        <p className={styles.subtitle}>
          Showing {formatRangeLabel(range.startDate, range.endDate)} &middot;
          All figures exclude VAT unless noted
        </p>
      </div>

      {/* ── Date-range search ────────────────────────────────────────── */}
      <FinancialsDateRangeForm
        startDate={range.startDate}
        endDate={range.endDate}
        onApply={(startDate, endDate) => setRange({ startDate, endDate })}
      />

      {/* ── KPI row ───────────────────────────────────────────────────── */}
      <FinancialsKpiRow startDate={range.startDate} endDate={range.endDate} />

      {/* ── Revenue trend ─────────────────────────────────────────────── */}
      <RevenueTrendChart startDate={range.startDate} endDate={range.endDate} />

      {/* ── Breakdown row: payment funnel (wide) + by level (narrow) ─────── */}
      <div className={styles.breakdownRow}>
        <PaymentFunnelChart
          startDate={range.startDate}
          endDate={range.endDate}
        />
        <RevenueByLevelChart
          startDate={range.startDate}
          endDate={range.endDate}
        />
      </div>
    </div>
  );
}

export default FinancialsPage;
