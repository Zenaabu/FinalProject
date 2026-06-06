// ─── RegistrationRow.jsx ──────────────────────────────────────────────────────
// A single <tr> inside the Recent Registrations table.
// ──────────────────────────────────────────────────────────────────────────────

import AvatarInitials from "../shared/AvatarInitials";
import PaymentBadge from "../shared/PaymentBadge";
import styles from "./RegistrationRow.module.css";

function RegistrationRow({ name, course, date, payment }) {
  return (
    <tr className={styles.row}>
      {/* ── Student name with avatar ───────────────────────────────────── */}
      <td>
        <div className={styles.nameCell}>
          <AvatarInitials name={name} size={34} />
          <span className={styles.name}>{name}</span>
        </div>
      </td>

      {/* ── Course name ────────────────────────────────────────────────── */}
      <td className={styles.course}>{course}</td>

      {/* ── Registration date ──────────────────────────────────────────── */}
      <td className={styles.date}>{date}</td>

      {/* ── Payment status badge ───────────────────────────────────────── */}
      <td>
        <PaymentBadge status={payment} />
      </td>
    </tr>
  );
}

export default RegistrationRow;
