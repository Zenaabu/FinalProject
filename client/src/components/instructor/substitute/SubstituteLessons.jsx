// ─── SubstituteLessons.jsx ────────────────────────────────────────────────────
// /instructor/substitute-lessons
// Lessons the logged-in instructor was assigned to cover for another
// instructor (admin resolved a time-off request with "assign substitute"
// on that lesson, see AffectedLessonsPanel on the admin side). These are not
// courses this instructor owns, so they don't show up under "My Courses" —
// this is the one place they see "you're covering this".
//
//   GET /api/instructor/substitute-lessons -> [{ lesson_id, course_id,
//     course_description, lesson_number, lesson_date, start_time, end_time,
//     original_instructor_name, can_take_attendance }]
//
// Picking a lesson goes to /instructor/substitute-lessons/:lesson_id, where
// attendance for just that one lesson is taken.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./SubstituteLessons.module.css";

function SubstituteLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/instructor/substitute-lessons")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(
            data.message || "Failed to load your substitute lessons",
          );
        }
        setLessons(data.lessons);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.stateError}>Error: {error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Substitute Lessons</h1>
        <p className={styles.subtitle}>
          Lessons another instructor couldn't teach, that an admin assigned
          you to cover.
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className={styles.state}>
          You're not covering any lessons right now.
        </div>
      ) : (
        <div className={styles.grid}>
          {lessons.map((lesson) => (
            <Link
              key={lesson.lesson_id}
              to={`/instructor/substitute-lessons/${lesson.lesson_id}`}
              className={styles.card}
            >
              <div className={styles.cardTop}>
                <span className={styles.badge}>
                  Covering for {lesson.original_instructor_name}
                </span>
                {!lesson.can_take_attendance && (
                  <span className={styles.badgeMuted}>Not open yet</span>
                )}
              </div>

              <h2 className={styles.cardTitle}>{lesson.course_description}</h2>

              <dl className={styles.meta}>
                <div className={styles.metaRow}>
                  <dt>Lesson</dt>
                  <dd>{lesson.lesson_number}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Date</dt>
                  <dd>{lesson.lesson_date}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Time</dt>
                  <dd>
                    {lesson.start_time}–{lesson.end_time}
                  </dd>
                </div>
              </dl>

              <span className={styles.cta}>Take attendance →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubstituteLessons;
