// ─── CourseRow.jsx ────────────────────────────────────────────────────────────
// A single <tr> inside the dashboard's Courses table.
// ──────────────────────────────────────────────────────────────────────────────

import PaymentBadge from "../shared/PaymentBadge";
import styles from "./CourseRow.module.css";

function CourseRow({ name, start_date, end_date, status }) {
  return (
    <tr className={styles.row}>
      {/* ── Course name ────────────────────────────────────────────────── */}
      <td className={styles.name}>{name}</td>

      {/* ── Start / end dates ─────────────────────────────────────────── */}
      <td className={styles.date}>{start_date}</td>
      <td className={styles.date}>{end_date}</td>

      {/* ── Status badge ──────────────────────────────────────────────── */}
      <td>
        <PaymentBadge status={status} />
      </td>
    </tr>
  );
}

export default CourseRow;
