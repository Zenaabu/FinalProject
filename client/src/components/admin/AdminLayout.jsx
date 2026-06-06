// ─── AdminLayout.jsx ──────────────────────────────────────────────────────────
// Wrapper layout for all /admin/* pages.
// Renders the fixed sidebar + a scrollable main content area via <Outlet />.
// ──────────────────────────────────────────────────────────────────────────────

import { Outlet } from "react-router-dom";
import AdminSidebar from "./sidebar/AdminSidebar";
import styles from "./AdminLayout.module.css";

function AdminLayout() {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
