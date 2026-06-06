// ─── ActionButton.jsx ─────────────────────────────────────────────────────────
// A single Quick Action button. Accepts a `variant` prop for colour theming:
//   "primary"  → light blue (--color-light-accent)
//   "dark"     → ocean blue (--color-ocean-text)
//   "success"  → green
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./ActionButton.module.css";

function ActionButton({ label, icon, variant = "primary", onClick }) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]}`}
      type="button"
      onClick={onClick}
    >
      <span className={styles.iconWrap}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}

export default ActionButton;
