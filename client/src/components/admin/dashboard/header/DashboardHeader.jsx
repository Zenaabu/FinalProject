// ─── DashboardHeader.jsx ──────────────────────────────────────────────────────
// Top bar: page title and formatted today's date.
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./DashboardHeader.module.css";

function DashboardHeader() {
  const formatted = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Dashboard Home</h1>
        <p className={styles.subtitle}>
          {formatted} &middot; All figures exclude VAT (17%) unless noted
        </p>
      </div>
    </div>
  );
}

export default DashboardHeader;
