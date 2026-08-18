// ─── Header.jsx ───────────────────────────────────────────────────────────────
// Sticky header for the user portal: logo + nav + logout.
// ──────────────────────────────────────────────────────────────────────────────

import { NavLink, Link, useNavigate } from "react-router-dom";
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

  function handleLogout() {
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
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
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
