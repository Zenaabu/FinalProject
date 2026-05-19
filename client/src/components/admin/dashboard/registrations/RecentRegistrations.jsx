// ─── RecentRegistrations.jsx ──────────────────────────────────────────────────
// Card containing the registrations table.
// Mock data lives here — replace with an API call when the backend is ready.
// ──────────────────────────────────────────────────────────────────────────────

import RegistrationRow from "./RegistrationRow";
import styles from "./RecentRegistrations.module.css";

/* ── Mock data (replace with API call later) ─────────────────────────────── */
const REGISTRATIONS = [
  {
    id: 1,
    name: "Lior Ben-David",
    course: "Beginner Surf Basics",
    date: "2026-05-17",
    payment: "Paid",
  },
  {
    id: 2,
    name: "Maya Katz",
    course: "Intermediate Carving",
    date: "2026-05-16",
    payment: "Paid",
  },
  {
    id: 3,
    name: "Eitan Shamir",
    course: "Advanced Pipeline",
    date: "2026-05-15",
    payment: "Pending",
  },
  {
    id: 4,
    name: "Noa Cohen",
    course: "Beginner Surf Basics",
    date: "2026-05-14",
    payment: "Paid",
  },
  {
    id: 5,
    name: "Avi Peretz",
    course: "Intermediate Carving",
    date: "2026-05-13",
    payment: "Pending",
  },
  {
    id: 6,
    name: "Shira Levi",
    course: "Advanced Pipeline",
    date: "2026-05-12",
    payment: "Paid",
  },
];

function RecentRegistrations() {
  return (
    <div className={styles.card}>
      {/* ── Card header ───────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Recent Registrations</h2>
        <button className={styles.viewAll} type="button">
          View All &rsaquo;
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course</th>
              <th>Date</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {REGISTRATIONS.map((r) => (
              <RegistrationRow key={r.id} {...r} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentRegistrations;
