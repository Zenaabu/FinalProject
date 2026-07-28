// ─── InstructorLayout.jsx ─────────────────────────────────────────────────────
// Wrapper layout for all /instructor/* pages.
// Same shell as the admin panel, with the instructor's own navigation.
// ──────────────────────────────────────────────────────────────────────────────

import { Outlet } from "react-router-dom";
import AdminSidebar from "../admin/sidebar/AdminSidebar";
import { INSTRUCTOR_NAV_ITEMS } from "./instructorNavConfig";
import styles from "./InstructorLayout.module.css";

function InstructorLayout() {
  return (
    <div className={styles.layout}>
      <AdminSidebar
        subtitle="Instructor Panel"
        items={INSTRUCTOR_NAV_ITEMS}
        rootPath="/instructor"
        ariaLabel="Instructor navigation"
      />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default InstructorLayout;
