// ─── DashboardHeader.jsx ──────────────────────────────────────────────────────
// Top bar: page title, formatted today's date, and the current school-wide
// VAT rate. The rate is read from GET /api/admin/financials/vat-rate (the same
// value the Financials page edits), so changing VAT there updates this line
// the next time the dashboard loads — it is never hardcoded.
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import styles from "./DashboardHeader.module.css";

function DashboardHeader() {
  const formatted = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // null until loaded (or if the request fails) — the subtitle then just
  // says "VAT" without a number rather than showing a wrong one
  const [vatPercent, setVatPercent] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/financials/vat-rate")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setVatPercent(data.vat_percent);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Dashboard Home</h1>
        <p className={styles.subtitle}>
          {formatted} &middot; All figures exclude VAT
          {vatPercent !== null && ` (${vatPercent}%)`} unless noted
        </p>
      </div>
    </div>
  );
}

export default DashboardHeader;
