// ─── InstructorConstraints.jsx ────────────────────────────────────────────────
// Full-width bottom table previewing instructor time constraints, backed by
// GET /api/admin/instructor-constraints. Pending requests (the admin hasn't
// approved or rejected them yet) are surfaced first and counted in the
// "N need review" badge, since those are the ones waiting on the admin.
// Full review (approve/reject, affected lessons) happens on /admin/staff.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AvatarInitials from "../shared/AvatarInitials";
import PaymentBadge from "../shared/PaymentBadge";
import styles from "./InstructorConstraints.module.css";

const PREVIEW_LIMIT = 5;

function InstructorConstraints() {
  const [constraints, setConstraints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/admin/instructor-constraints")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setConstraints(data.constraints);
      })
      .catch(() => {
        // non-blocking: the table just stays empty
      });
  }, []);

  const pendingCount = useMemo(
    () => constraints.filter((c) => c.status === "pending").length,
    [constraints],
  );

  // pending requests need the admin's attention, so they're shown first;
  // everything else keeps the soonest-starting constraints on top
  const preview = useMemo(() => {
    const pending = constraints.filter((c) => c.status === "pending");
    const decided = constraints.filter((c) => c.status !== "pending");
    return [...pending, ...decided].slice(0, PREVIEW_LIMIT);
  }, [constraints]);

  return (
    <div className={styles.card}>
      {/* ── Card header ─────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Upcoming Instructor Constraints</h2>
        {pendingCount > 0 && (
          <span className={styles.reviewBadge}>{pendingCount} need review</span>
        )}
        <button
          className={styles.viewAll}
          type="button"
          onClick={() => navigate("/admin/staff")}
        >
          View All &rsaquo;
        </button>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Instructor</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((c) => (
              <tr key={c.constraints_id} className={styles.row}>
                <td>
                  <div className={styles.nameCell}>
                    <AvatarInitials name={c.instructor_name} size={32} />
                    <span className={styles.name}>{c.instructor_name}</span>
                  </div>
                </td>
                <td className={styles.dateCell}>
                  {c.start_date === c.end_date
                    ? c.start_date
                    : `${c.start_date} → ${c.end_date}`}
                </td>
                <td className={styles.reasonCell}>{c.notes}</td>
                <td>
                  <PaymentBadge
                    status={c.status[0].toUpperCase() + c.status.slice(1)}
                  />
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
