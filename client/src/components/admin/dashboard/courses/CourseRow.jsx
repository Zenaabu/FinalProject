// ─── CourseRow.jsx ────────────────────────────────────────────────────────────
// A single <tr> inside the dashboard's Courses table.
// ──────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import PaymentBadge from "../shared/PaymentBadge";
import styles from "./CourseRow.module.css";

function CourseRow({
  course_id,
  name,
  start_date,
  end_date,
  status,
  under_capacity,
}) {
  const navigate = useNavigate();

  // Jumps to Courses & Lessons with this course's accordion already open,
  // instead of making the admin find and click it again over there.
  function openInCourseManager() {
    navigate("/admin/courses", { state: { openCourseId: course_id } });
  }

  return (
    <tr
      className={styles.row}
      role="button"
      tabIndex={0}
      onClick={openInCourseManager}
      onKeyDown={(e) => e.key === "Enter" && openInCourseManager()}
    >
      {/* ── Course name ────────────────────────────────────────────────── */}
      <td className={styles.name}>
        {name}
        {under_capacity && (
          <span className={styles.underCapacityBadge}>
            <AlertTriangle size={11} />
            Under 50% capacity
          </span>
        )}
      </td>

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
