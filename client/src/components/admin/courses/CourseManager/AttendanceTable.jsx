// ─── AttendanceTable.jsx ──────────────────────────────────────────────────────
// Rendered inside an expanded LessonAccordionItem.
// Read-only roster — admin can see present / absent status only.
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./AttendanceTable.module.css";

function StatusBadge({ status }) {
  // Normalise any legacy "late" value to "absent"
  const display = status === "late" ? "absent" : status;
  return (
    <span className={`${styles.badge} ${styles[`badge_${display}`]}`}>
      {display.charAt(0).toUpperCase() + display.slice(1)}
    </span>
  );
}

function AttendanceTable({ students }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.user_id} className={styles.row}>
              <td className={styles.nameCell}>{s.name}</td>
              <td className={styles.emailCell}>{s.email}</td>
              <td>
                <StatusBadge status={s.attendance_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;
