// ─── QuickActions.jsx ─────────────────────────────────────────────────────────
// Card with three action buttons. To add a new action, push to ACTIONS array.
// ──────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { ClipboardList, Search } from "lucide-react";
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

function QuickActions() {
  const navigate = useNavigate();

  // ── Actions config ─────────────────────────────────────────────────────
  const ACTIONS = [
    {
      id: "create-course",
      label: "Create New Course",
      icon: PlusIcon,
      variant: "primary",
      // Jumps to Courses & Lessons with the create-course form already open.
      onClick: () =>
        navigate("/admin/courses", { state: { openCreate: true } }),
    },
    {
      id: "rosters",
      label: "View Course Rosters",
      icon: <ClipboardList size={18} />,
      variant: "dark",
      // Jumps to Users & Rosters with the "Course Rosters" tab pre-selected.
      onClick: () => navigate("/admin/users", { state: { tab: "rosters" } }),
    },
    {
      id: "user-database",
      label: "Search Users",
      icon: <Search size={18} />,
      variant: "success",
      // Jumps to Users & Rosters, User Database tab, with the search box
      // already focused so admins can start typing immediately.
      onClick: () =>
        navigate("/admin/users", {
          state: { tab: "users", autoFocusSearch: true },
        }),
    },
  ];

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
