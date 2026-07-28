// ─── Header.jsx ───────────────────────────────────────────────────────────────
// Sticky header for the user portal: logo + nav + logout.
// ──────────────────────────────────────────────────────────────────────────────

import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { to: "/user", label: "Dashboard", end: true },
  { to: "/user/courses", label: "Course Catalog", end: true },
  { to: "/user/my-courses", label: "My Courses" },
  { to: "/user/profile", label: "Profile" },
];

function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      localStorage.removeItem("user_id");
      navigate("/login");
    });
  }

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <span className={styles.logo}>Blue Mars</span>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
