// ─── StatsRow.jsx ─────────────────────────────────────────────────────────────
// Renders the four KPI cards side by side, backed by GET /api/admin/dashboard-stats.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import StatCard from "./StatCard";
import styles from "./StatsRow.module.css";

/* ── Icon SVGs (inline — no library needed) ─────────────────────────────── */
const CoursesIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const StudentsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const ClockIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ── Card styling (data comes from the API, only presentation lives here) ── */
function buildCards(stats) {
  return [
    {
      id: "courses",
      label: "Active Courses",
      value: stats ? stats.active_courses : "—",
      sub: "Currently active",
      subColor: "#64748b",
      iconBg: "rgba(56, 189, 248, 0.12)",
      iconColor: "var(--color-ocean-text)",
      icon: CoursesIcon,
    },
    {
      id: "students",
      label: "Registered Students",
      value: stats ? stats.registered_students : "—",
      sub: stats ? `+${stats.new_students_week} this week` : "",
      subColor: "#15803d",
      iconBg: "rgba(34, 197, 94, 0.12)",
      iconColor: "#15803d",
      icon: StudentsIcon,
    },
    {
      id: "pending-constraints",
      label: "Pending Constraints",
      value: stats ? stats.pending_constraints : "—",
      sub:
        stats && stats.pending_constraints > 0
          ? "Awaiting approval"
          : "All caught up",
      subColor: stats && stats.pending_constraints > 0 ? "#b45309" : "#64748b",
      iconBg: "rgba(139, 92, 246, 0.12)",
      iconColor: "#7c3aed",
      icon: ClockIcon,
    },
    {
      id: "at-risk",
      label: "Courses Starting Soon",
      value: stats ? stats.at_risk_courses : "—",
      sub:
        stats && stats.at_risk_courses > 0
          ? "Under 50% capacity, within 7 days"
          : "None under 50% capacity",
      subColor: stats && stats.at_risk_courses > 0 ? "#dc2626" : "#15803d",
      iconBg: "rgba(220, 38, 38, 0.12)",
      iconColor: "#dc2626",
      icon: AlertIcon,
    },
  ];
}

function StatsRow() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      })
      .catch(() => {
        // non-blocking: cards just keep showing placeholders
      });
  }, []);

  return (
    <div className={styles.row}>
      {buildCards(stats).map((s) => (
        <StatCard key={s.id} {...s} />
      ))}
    </div>
  );
}

export default StatsRow;
