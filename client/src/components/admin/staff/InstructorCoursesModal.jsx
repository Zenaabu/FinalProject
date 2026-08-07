// ─── InstructorCoursesModal.jsx ────────────────────────────────────────────
// Pop-up showing the courses a specific instructor is CURRENTLY teaching
// (their own courses — not lessons they're only covering as a substitute).
// The API already excludes courses that have finished, so every course here
// is either running now or still upcoming — a course drops off this list on
// its own once it ends.
// Props:
//   instructor  – { user_id, instructor_name } the "View Courses" action
//                  was clicked for
//   onClose     – fn() called when the admin closes the modal
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { GraduationCap, X } from "lucide-react";
import styles from "./InstructorCoursesModal.module.css";

function statusOf(course) {
  const today = new Date().toISOString().slice(0, 10);
  return course.start_date > today ? "Upcoming" : "Running";
}

const STATUS_CLASS = {
  Running: "statusRunning",
  Upcoming: "statusUpcoming",
};

function InstructorCoursesModal({ instructor, onClose }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/instructors/${instructor.user_id}/courses`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load courses");
        }
        setCourses(data.courses);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [instructor.user_id]);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className={styles.title}>Teaching Courses</h2>
            <p className={styles.sub}>
              Currently taught by{" "}
              <strong>{instructor.instructor_name}</strong>
            </p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className={styles.body}>
          {loading && <p className={styles.state}>Loading…</p>}

          {!loading && error && <p className={styles.stateError}>{error}</p>}

          {!loading && !error && courses.length === 0 && (
            <p className={styles.state}>
              This instructor isn't currently teaching any course.
            </p>
          )}

          {!loading && !error && courses.length > 0 && (
            <ul className={styles.courseList}>
              {courses.map((course) => {
                const status = statusOf(course);
                return (
                  <li key={course.course_id} className={styles.courseItem}>
                    <div className={styles.courseTop}>
                      <span className={styles.courseName}>
                        {course.description}
                      </span>
                      <span
                        className={`${styles.statusBadge} ${styles[STATUS_CLASS[status]]}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className={styles.courseMeta}>
                      <span>
                        {course.start_date} – {course.end_date}
                      </span>
                      <span>
                        {course.lessons_count} of {course.total_lessons}{" "}
                        lessons scheduled
                      </span>
                      <span>
                        {course.enrolled} / {course.capacity} enrolled
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className={styles.footer}>
          <button className={styles.btnClose} type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstructorCoursesModal;
