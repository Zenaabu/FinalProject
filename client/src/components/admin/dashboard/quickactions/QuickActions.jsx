// ─── QuickActions.jsx ─────────────────────────────────────────────────────────
// Card with three action buttons. To add a new action, push to ACTIONS array.
// ──────────────────────────────────────────────────────────────────────────────

import ActionButton from "./ActionButton";
import styles from "./QuickActions.module.css";

/* ── Inline SVG icons ────────────────────────────────────────────────────── */
const PlusIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CalendarIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TrendIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

/* ── Actions config ──────────────────────────────────────────────────────── */
const ACTIONS = [
  {
    id: "create-course",
    label: "Create New Course",
    icon: PlusIcon,
    variant: "primary",
  },
  {
    id: "constraints",
    label: "Submit Constraints (Manager)",
    icon: CalendarIcon,
    variant: "dark",
  },
  {
    id: "profit-report",
    label: "Generate Profit Report",
    icon: TrendIcon,
    variant: "success",
  },
];

function QuickActions() {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Quick Actions</h2>
      <div className={styles.list}>
        {ACTIONS.map((a) => (
          <ActionButton key={a.id} {...a} />
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
