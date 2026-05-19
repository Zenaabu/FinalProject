// ─── InstructorConstraints.jsx ────────────────────────────────────────────────
// Full-width bottom table showing upcoming instructor time constraints.
// The "N need review" badge count is computed dynamically from the data.
// ──────────────────────────────────────────────────────────────────────────────

import AvatarInitials from "../shared/AvatarInitials";
import PaymentBadge from "../shared/PaymentBadge";
import styles from "./InstructorConstraints.module.css";

/* ── Mock data (replace with API call later) ─────────────────────────────── */
const CONSTRAINTS = [
  {
    id: 1,
    name: "Rotem Gal",
    date: "2026-05-20",
    time: "08:00–12:00",
    reason: "Medical appointment",
    status: "Noted",
  },
  {
    id: 2,
    name: "Dan Mizrahi",
    date: "2026-05-21",
    time: "14:00–18:00",
    reason: "Family event",
    status: "Pending",
  },
  {
    id: 3,
    name: "Liat Nevo",
    date: "2026-05-22",
    time: "09:00–11:00",
    reason: "Training session",
    status: "Pending",
  },
];

function InstructorConstraints() {
  const pendingCount = CONSTRAINTS.filter((c) => c.status === "Pending").length;

  return (
    <div className={styles.card}>
      {/* ── Card header ─────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Upcoming Instructor Constraints</h2>
        {pendingCount > 0 && (
          <span className={styles.reviewBadge}>{pendingCount} need review</span>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Instructor</th>
              <th>Constraint Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {CONSTRAINTS.map((c) => (
              <tr key={c.id} className={styles.row}>
                <td>
                  <div className={styles.nameCell}>
                    <AvatarInitials name={c.name} size={32} />
                    <span className={styles.name}>{c.name}</span>
                  </div>
                </td>
                <td className={styles.dateCell}>{c.date}</td>
                <td className={styles.timeCell}>{c.time}</td>
                <td className={styles.reasonCell}>{c.reason}</td>
                <td>
                  <PaymentBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InstructorConstraints;
