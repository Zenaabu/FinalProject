// ─── StatsRow.jsx ─────────────────────────────────────────────────────────────
// Renders the four KPI cards side by side.
// To update a stat value, edit STATS below — no other file needs changing.
// ──────────────────────────────────────────────────────────────────────────────

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

/* ── Stats data ──────────────────────────────────────────────────────────── */
const STATS = [
  {
    id: "courses",
    label: "Active Courses",
    value: "15",
    sub: "+2 this month",
    subColor: "#15803d",
    iconBg: "rgba(56, 189, 248, 0.12)",
    iconColor: "var(--color-ocean-text)",
    icon: CoursesIcon,
  },
  {
    id: "students",
    label: "Registered Students",
    value: "120",
    sub: "+8 this week",
    subColor: "#15803d",
    iconBg: "rgba(34, 197, 94, 0.12)",
    iconColor: "#15803d",
    icon: StudentsIcon,
  },
  {
    id: "instructors",
    label: "Active Instructors",
    value: "8",
    sub: "All scheduled",
    subColor: "#64748b",
    iconBg: "rgba(139, 92, 246, 0.12)",
    iconColor: "#7c3aed",
    icon: InstructorsIcon,
  },
  {
    id: "profit",
    label: "Monthly Profit",
    value: "₪18,500",
    sub: "Excl. VAT (17%)",
    subColor: "#dc2626",
    iconBg: "rgba(34, 197, 94, 0.12)",
    iconColor: "#15803d",
    icon: ProfitIcon,
  },
];

function StatsRow() {
  return (
    <div className={styles.row}>
      {STATS.map((s) => (
        <StatCard key={s.id} {...s} />
      ))}
    </div>
  );
}

export default StatsRow;
