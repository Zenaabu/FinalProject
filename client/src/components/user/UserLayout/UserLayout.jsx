// ─── UserLayout.jsx ───────────────────────────────────────────────────────────
// Wrapper layout for all /user/* pages: sticky header on top, page content
// below via <Outlet />. Mirrors AdminLayout/InstructorLayout structurally, but
// the user portal reads top-to-bottom rather than sidebar + content.
// ──────────────────────────────────────────────────────────────────────────────

import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import styles from "./UserLayout.module.css";

function UserLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;
