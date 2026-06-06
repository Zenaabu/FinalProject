// --- AttendanceTable.jsx ---
// Rendered inside an expanded LessonAccordionItem.
// Shows every student who has a row in the `attend` table for this lesson.
// ---

import styles from "./AttendanceTable.module.css";

function StatusBadge({ status }) {
  const display = status === "late" ? "absent" : status;
  return (
    <span className={`${styles.badge} ${styles[`badge_${display}`]}`}>
      {display.charAt(0).toUpperCase() + display.slice(1)}
    </span>
  );
}

function AttendanceTable({ students }) {
  // Guard: undefined / null -> empty array
  const roster = students ?? [];

  // Empty state: shown when no rows exist in `attend` for this lesson yet
  if (roster.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>No attendance records for this lesson yet.</p>
      </div>
    );
  }

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
          {roster.map((s) => (
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