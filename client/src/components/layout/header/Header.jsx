import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./header.module.css";
import logo from "../../../assets/bluemarsLogo.png";

// ─── Navbar Component ─────────────────────────────────────────────────────────
// The outermost <nav> uses the CSS class `navbar` which is a flex container.
// `justify-content: space-between` pushes the three sections (left / center / right)
// to the far ends and perfectly centers the middle section automatically.
// ──────────────────────────────────────────────────────────────────────────────
function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleCoursesClick(e) {
    e.preventDefault();
    if (location.pathname === "/") {
      document
        .getElementById("courses")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById("courses")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  return (
    <header className={styles.header}>
    <nav className={styles.navbar}>
      {/* ── LEFT: Brand ─────────────────────────────────────────────────── */}
      <div className={styles.navBrand}>
        <img src={logo} alt="Blue Mars logo" className={styles.logo} />
        <span className={styles.brandName}>Blue Mars</span>
      </div>

      {/* ── CENTER: Navigation Links ─────────────────────────────────── */}
      {/* `align-items: center` keeps every link vertically centered       */}
      <ul className={styles.navLinks}>
        <li>
          <Link to="/" className={styles.navLink}>
            Home
          </Link>
        </li>
        <li>
          <a
            href="#courses"
            onClick={handleCoursesClick}
            className={styles.navLink}
          >
            Our Courses
          </a>
        </li>
        <li>
          <Link to="/journey" className={styles.navLink}>
            Surf Basics
          </Link>
        </li>
        <li>
          <Link to="/about" className={styles.navLink}>
            About Us
          </Link>
        </li>
      </ul>

      {/* ── RIGHT: Auth Buttons ──────────────────────────────────────── */}
      <div className={styles.navAuth}>
        <Link to="/login" className={styles.btnOutline}>
          Log In
        </Link>
        <Link to="/signup" className={styles.btnPrimary}>
          Sign Up
        </Link>
      </div>
    </nav>
    </header>
  );
}

export default Navbar;
