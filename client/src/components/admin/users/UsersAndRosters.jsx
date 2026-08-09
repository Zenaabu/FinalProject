// ─── UsersAndRosters.jsx ──────────────────────────────────────────────────────
// Parent container for /admin/users.
// Holds the active-tab state and renders either UserDatabase or CourseRosters.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserDatabase from "./database/UserDatabase";
import CourseRosters from "./rosters/CourseRosters";
import styles from "./UsersAndRosters.module.css";

const TABS = [
  { id: "users", label: "User Database" },
  { id: "rosters", label: "Course Rosters" },
];

function UsersAndRosters() {
  const location = useLocation();
  const navigate = useNavigate();

  // Quick Actions on the dashboard navigates here with
  // { state: { tab: "rosters" | "users", autoFocusSearch: true } } to land
  // on a specific tab, optionally with the User Database search box focused.
  const [activeTab, setActiveTab] = useState(
    TABS.some((t) => t.id === location.state?.tab)
      ? location.state.tab
      : "users",
  );
  const [autoFocusSearch] = useState(Boolean(location.state?.autoFocusSearch));

  useEffect(() => {
    if (location.state?.tab) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.page}>
      {/* ── Page title ──────────────────────────────────────────────── */}
      <h1 className={styles.title}>Users &amp; Rosters</h1>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Active child view ────────────────────────────────────────── */}
      <div>
        {activeTab === "users" && (
          <UserDatabase autoFocusSearch={autoFocusSearch} />
        )}
        {activeTab === "rosters" && <CourseRosters />}
      </div>
    </div>
  );
}

export default UsersAndRosters;
