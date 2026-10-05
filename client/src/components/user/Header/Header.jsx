// ─── Header.jsx ───────────────────────────────────────────────────────────────
// Sticky header for the user portal: logo + nav + logout.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import LogoutConfirmModal from "../../shared/LogoutConfirmModal";
import styles from "./Header.module.css";
import surfboardIcon from "../../../assets/surfboard.png";
import bluemarsLogo from "../../../assets/bluemarsLogo.png";

const NAV_LINKS = [
  { to: "/user", label: "Dashboard", end: true },
  { to: "/user/courses", label: "Course Catalog", end: true },
  { to: "/user/my-courses", label: "My Courses" },
  { to: "/user/profile", label: "Profile" },
];

function Header() {
  const navigate = useNavigate();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function handleLogout() {
    setLoggingOut(true);
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      localStorage.removeItem("user_id");
      navigate("/login");
    });
  }

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <span className={styles.logo}>
          <img
            src={bluemarsLogo}
            alt=""
            className={styles.logoIcon}
            aria-hidden="true"
          />
          Blue Mars
        </span>

        <div className={styles.topRight}>
          <Link to="/volume-calculator" className={styles.volumeLink}>
            <img
              src={surfboardIcon}
              alt=""
              className={styles.volumeIcon}
              aria-hidden="true"
            />
            <span>
              Find Your Volume
              <small>Board volume calculator</small>
            </span>
          </Link>

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => setConfirmingLogout(true)}
          >
            Logout
          </button>
        </div>
      </div>

      {confirmingLogout && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onClose={() => setConfirmingLogout(false)}
          loggingOut={loggingOut}
        />
      )}

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
