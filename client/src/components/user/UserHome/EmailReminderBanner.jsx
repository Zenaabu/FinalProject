// ─── EmailReminderBanner.jsx ────────────────────────────────────────────────
// Small heads-up shown on the dashboard home so students notice we email
// them whenever a lesson's date or time changes (bad weather, instructor
// availability, etc.) instead of only finding out at the beach.
// ──────────────────────────────────────────────────────────────────────────

import { Mail } from "lucide-react";
import styles from "./EmailReminderBanner.module.css";

function EmailReminderBanner() {
  return (
    <div className={styles.banner} role="status">
      <Mail size={20} className={styles.icon} aria-hidden="true" />
      <p className={styles.text}>
        <span className={styles.textStrong}>Keep an eye on your inbox — </span>
        we'll always email you if a lesson's date or time changes, so you
        never miss an update.
      </p>
    </div>
  );
}

export default EmailReminderBanner;
