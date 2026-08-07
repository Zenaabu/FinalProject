// ─── FinancialsPage.jsx ───────────────────────────────────────────────────────
// Root page for /admin/financials. KPI row, revenue trend, then a breakdown
// row (by course / by level) — each section owns its own data fetch.
// ──────────────────────────────────────────────────────────────────────────────

import FinancialsKpiRow from "./kpis/FinancialsKpiRow";
import RevenueTrendChart from "./charts/RevenueTrendChart";
import PaymentFunnelChart from "./charts/PaymentFunnelChart";
import RevenueByLevelChart from "./charts/RevenueByLevelChart";
import styles from "./FinancialsPage.module.css";

function FinancialsPage() {
  const formatted = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Financials</h1>
        <p className={styles.subtitle}>
          {formatted} &middot; All figures exclude VAT unless noted
        </p>
      </div>

      {/* ── KPI row ───────────────────────────────────────────────────── */}
      <FinancialsKpiRow />

      {/* ── Revenue trend ─────────────────────────────────────────────── */}
      <RevenueTrendChart />

      {/* ── Breakdown row: payment funnel (wide) + by level (narrow) ─────── */}
      <div className={styles.breakdownRow}>
        <PaymentFunnelChart />
        <RevenueByLevelChart />
      </div>
    </div>
  );
}

export default FinancialsPage;
