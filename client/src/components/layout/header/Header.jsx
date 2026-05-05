import { Link } from "react-router-dom";
import styles from "./header.module.css";
import logo from "../../../assets/bluemarsLogo.png";

// ─── Navbar Component ─────────────────────────────────────────────────────────
// The outermost <nav> uses the CSS class `navbar` which is a flex container.
// `justify-content: space-between` pushes the three sections (left / center / right)
// to the far ends and perfectly centers the middle section automatically.
// ──────────────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
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
          <Link to="/courses" className={styles.navLink}>
            Our Courses
          </Link>
        </li>
        <li>
          <Link to="/journey" className={styles.navLink}>
            My Surf Journey
          </Link>
        </li>
      </ul>

      {/* ── RIGHT: Auth Buttons ──────────────────────────────────────── */}
      <div className={styles.navAuth}>
        <Link to="/login" className={styles.loginLink}>
          Log In
        </Link>
        <Link to="/signup" className={styles.signupButton}>
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
