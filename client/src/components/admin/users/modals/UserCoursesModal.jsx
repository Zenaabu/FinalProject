// ─── UserCoursesModal.jsx ──────────────────────────────────────────────────────
// Pop-up showing the courses a specific user is currently enrolled in.
// Only courses that haven't finished yet are returned by the API — once a
// course ends it drops off this list on its own, so the admin only ever sees
// what that user is actually in right now.
// Props:
//   user     – the user object the "View Courses" action was clicked for
//   onClose  – fn() called when the admin closes the modal
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { BookOpen, X } from "lucide-react";
import styles from "./UserCoursesModal.module.css";

function UserCoursesModal({ user, onClose }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/users/${user.id}/courses`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load courses");
        }
        setCourses(data.courses);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.id]);

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
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className={styles.title}>Enrolled Courses</h2>
            <p className={styles.sub}>
              Active courses for <strong>{user.name}</strong>
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

          {!loading && error && (
            <p className={styles.stateError}>{error}</p>
          )}

          {!loading && !error && courses.length === 0 && (
            <p className={styles.state}>
              This user isn't enrolled in any active course right now.
            </p>
          )}

          {!loading && !error && courses.length > 0 && (
            <ul className={styles.courseList}>
              {courses.map((course) => (
                <li key={course.course_id} className={styles.courseItem}>
                  <div className={styles.courseTop}>
                    <span className={styles.courseName}>
                      {course.description}
                    </span>
                    <span className={styles.levelBadge}>{course.level}</span>
                  </div>
                  <div className={styles.courseMeta}>
                    <span>
                      {course.start_date} – {course.end_date}
                    </span>
                    {course.instructor && (
                      <span>Instructor: {course.instructor}</span>
                    )}
                  </div>
                </li>
              ))}
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

export default UserCoursesModal;
