// ─── RecentRegistrations.jsx ──────────────────────────────────────────────────
// Card containing the registrations table, backed by
// GET /api/admin/recent-registrations.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import RegistrationRow from "./RegistrationRow";
import styles from "./RecentRegistrations.module.css";

function RecentRegistrations() {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetch("/api/admin/recent-registrations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRegistrations(data.registrations);
      })
      .catch(() => {
        // non-blocking: the table just stays empty
      });
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <RegistrationRow key={r.receipt_number} {...r} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentRegistrations;
