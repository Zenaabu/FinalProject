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

const InstructorsIcon = (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ProfitIcon = (
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
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

function formatCurrency(value) {
  return `₪${Math.round(Number(value)).toLocaleString("en-US")}`;
}

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
      id: "instructors",
      label: "Active Instructors",
      value: stats ? stats.active_instructors : "—",
      sub: "Not blocked",
      subColor: "#64748b",
      iconBg: "rgba(139, 92, 246, 0.12)",
      iconColor: "#7c3aed",
      icon: InstructorsIcon,
    },
    {
      id: "profit",
      label: "Monthly Profit",
      value: stats ? formatCurrency(stats.monthly_profit) : "—",
      sub: "Excl. VAT, this month",
      subColor: "#15803d",
      iconBg: "rgba(34, 197, 94, 0.12)",
      iconColor: "#15803d",
      icon: ProfitIcon,
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
