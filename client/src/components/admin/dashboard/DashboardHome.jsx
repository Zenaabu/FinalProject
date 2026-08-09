// ─── DashboardHome.jsx ────────────────────────────────────────────────────────
// Root page for /admin. Assembles all dashboard sections like Lego pieces.
// To add a new section: import it and drop it here — no other file changes needed.
// ──────────────────────────────────────────────────────────────────────────────

import DashboardHeader from "./header/DashboardHeader";
import StatsRow from "./stats/StatsRow";
import RecentCourses from "./courses/RecentCourses";
import QuickActions from "./quickactions/QuickActions";
import InstructorConstraints from "./constraints/InstructorConstraints";
import styles from "./DashboardHome.module.css";

function DashboardHome() {
  return (
    <div className={styles.page}>
      {/* ── 1. Header: title + date + status ────────────────────────── */}
      <DashboardHeader />

      {/* ── 2. KPI stat cards ───────────────────────────────────────── */}
      <StatsRow />

      {/* ── 3. Main two-column row ──────────────────────────────────── */}
      <div className={styles.mainRow}>
        {/* Left: courses table */}
        <RecentCourses />

        {/* Right: quick actions */}
        <div className={styles.rightCol}>
          <QuickActions />
        </div>
      </div>

      {/* ── 4. Full-width constraints table ─────────────────────────── */}
      <InstructorConstraints />
    </div>
  );
}

export default DashboardHome;
