// ─── UsersAndRosters.jsx ──────────────────────────────────────────────────────
// Parent container for /admin/users.
// Holds the active-tab state and renders either UserDatabase or CourseRosters.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import UserDatabase from "./database/UserDatabase";
import CourseRosters from "./rosters/CourseRosters";
import styles from "./UsersAndRosters.module.css";

const TABS = [
  { id: "users", label: "User Database" },
  { id: "rosters", label: "Course Rosters" },
];

function UsersAndRosters() {
  const [activeTab, setActiveTab] = useState("users");

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
        {activeTab === "users" && <UserDatabase />}
        {activeTab === "rosters" && <CourseRosters />}
      </div>
    </div>
  );
}

export default UsersAndRosters;
