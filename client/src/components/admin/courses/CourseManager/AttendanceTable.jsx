// ─── AttendanceTable.jsx ──────────────────────────────────────────────────────
// Rendered inside an expanded LessonAccordionItem.
// Displays a student roster with local status management via a <select>.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import styles from "./AttendanceTable.module.css";

const STATUS_OPTIONS = ["present", "late", "absent"];

function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AttendanceTable({ students }) {
  // Local state keyed by user_id so changes don't affect other lesson panels
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(students.map((s) => [s.user_id, s.attendance_status])),
  );

  const handleChange = (user_id, value) => {
    setStatuses((prev) => ({ ...prev, [user_id]: value }));
  };

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.user_id} className={styles.row}>
              <td className={styles.nameCell}>{s.name}</td>
              <td className={styles.emailCell}>{s.email}</td>
              <td>
                <StatusBadge status={statuses[s.user_id]} />
              </td>
              <td>
                <select
                  className={styles.select}
                  value={statuses[s.user_id]}
                  onChange={(e) => handleChange(s.user_id, e.target.value)}
                  aria-label={`Change attendance status for ${s.name}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;
