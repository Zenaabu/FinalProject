// ─── PaymentBadge.jsx ─────────────────────────────────────────────────────────
// Reusable status pill used in both the registrations table and the constraints
// table. The variant is inferred from the status string.
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./PaymentBadge.module.css";

function PaymentBadge({ status }) {
  const variant = styles[status.toLowerCase()] || styles.default;
  return <span className={`${styles.badge} ${variant}`}>{status}</span>;
}

export default PaymentBadge;
