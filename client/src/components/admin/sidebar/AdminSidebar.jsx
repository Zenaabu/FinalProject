// ─── AdminSidebar.jsx ─────────────────────────────────────────────────────────
// Root sidebar shell. Contains the brand/logo area at the top and renders
// SidebarNav below it. This is the only component imported by AdminLayout.
// ──────────────────────────────────────────────────────────────────────────────

import SidebarNav from "./SidebarNav";
import styles from "./AdminSidebar.module.css";

function AdminSidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* ── Brand area ──────────────────────────────────────────────────── */}
      <div className={styles.brand}>
        <span className={styles.brandName}>Blue Mars</span>
        <span className={styles.brandSub}>Admin Panel</span>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <SidebarNav />
    </aside>
  );
}

export default AdminSidebar;
