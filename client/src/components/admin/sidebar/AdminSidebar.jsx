// ─── AdminSidebar.jsx ─────────────────────────────────────────────────────────
// Root sidebar shell. Contains the brand/logo area at the top and renders
// SidebarNav below it. This is the only component imported by AdminLayout.
// ──────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import styles from "./AdminSidebar.module.css";

function AdminSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      localStorage.removeItem("user_id");
      navigate("/login");
    });
  }

  return (
    <aside className={styles.sidebar}>
      {/* ── Brand area ──────────────────────────────────────────────────── */}
      <div className={styles.brand}>
        <span className={styles.brandName}>Blue Mars</span>
        <span className={styles.brandSub}>Admin Panel</span>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <SidebarNav />

      {/* ── Logout ──────────────────────────────────────────────────────── */}
      <div className={styles.logoutWrap}>
        <button
          className={styles.logoutBtn}
          type="button"
          onClick={handleLogout}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
