// --- AttendanceTable.jsx ---
// Rendered inside an expanded LessonAccordionItem.
// Shows every student registered to the course, with the attendance the
// instructor recorded for this lesson. A student the instructor has not marked
// yet has attendance_status = null and shows as "Not marked".
// ---

import styles from "./AttendanceTable.module.css";

function StatusBadge({ status }) {
  // null / undefined => the instructor has not taken attendance for this
  // student yet
  if (!status) {
    return <span className={styles.badge}>Not marked</span>;
  }

  return (
    <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AttendanceTable({ students }) {
  // Guard: undefined / null -> empty array
  const roster = students ?? [];

  // Empty state: nobody is registered to this course yet
  if (roster.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>
          No students are registered to this course yet.
        </p>
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
