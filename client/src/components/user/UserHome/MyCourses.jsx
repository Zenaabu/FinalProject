// ─── MyCourses.jsx ─────────────────────────────────────────────────────────────
// Rendered on the user dashboard, below the weather widget.
//
//   GET /api/courses/my-courses — every course the user is registered to,
//   each with its next upcoming lesson (or null once the course is done).
//
// Enrolled in nothing yet -> show the same three marketing plan cards as the
// landing page, but pointed at the course catalog pre-filtered to that level
// instead of /signup (the user is already logged in).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CourseCard from "../../landing/sections/courses/CourseCard";
import { COURSES } from "../../landing/sections/courses/coursesData";
import { statusOf } from "../courseStatus";
import styles from "./MyCourses.module.css";

// the soonest next_lesson across every enrolled course, or null if none of
// them have a lesson left
function findNextLesson(courses) {
  let best = null;

  for (const course of courses) {
    if (!course.next_lesson) continue;

    const when = new Date(
      `${course.next_lesson.date}T${course.next_lesson.start_time}:00`,
    );

    if (!best || when < best.when) {
      best = { when, course, lesson: course.next_lesson };
    }
  }

  return best;
}

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/courses/my-courses")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load your courses");
        }
        setCourses(data.courses);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.state}>Loading your courses…</div>;
  }

  if (error) {
    return <div className={styles.stateError}>Error: {error}</div>;
  }

  // ── Not enrolled in anything yet — show the marketing cards ─────────────
  if (courses.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Find your level, ride your journey</h2>
          <p className={styles.sectionSubtitle}>
            You're not enrolled in any course yet — pick a track to get started.
          </p>
        </div>

        <div className={styles.promoGrid}>
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              linkTo={`/user/courses?level=${course.level.toLowerCase()}`}
            />
          ))}
        </div>
      </section>
    );
  }

  // ── Enrolled in at least one course ──────────────────────────────────────
  const next = findNextLesson(courses);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>My Courses</h2>
      </div>

      {/* ── Next lesson highlight ─────────────────────────────────────── */}
      {next ? (
        <div className={styles.nextLessonCard}>
          <span className={styles.nextLessonTag}>Your Next Lesson</span>
          <p className={styles.nextLessonCourse}>{next.course.description}</p>
          <p className={styles.nextLessonWhen}>
            {next.lesson.date} · {next.lesson.start_time}–{next.lesson.end_time}
          </p>
        </div>
      ) : (
        <div className={styles.nextLessonCardEmpty}>
          You have no upcoming lessons scheduled right now.
        </div>
      )}

      {/* ── Enrolled course list ──────────────────────────────────────── */}
      <div className={styles.grid}>
        {courses.map((course) => {
          const status = statusOf(course);

          return (
            <div key={course.course_id} className={styles.card}>
              <div className={styles.cardTop}>
                <span
                  className={`${styles.badge} ${styles[`badge${status}`]}`}
                >
                  {status}
                </span>
                <span className={`${styles.badge} ${styles.badgeLevel}`}>
                  {course.level}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{course.description}</h3>

              <p className={styles.cardMeta}>
                {course.start_date} – {course.end_date} · {course.instructor}
              </p>

              <p className={styles.cardNextLesson}>
                {course.next_lesson
                  ? `Next lesson: ${course.next_lesson.date} · ${course.next_lesson.start_time}–${course.next_lesson.end_time}`
                  : "No more lessons scheduled."}
              </p>
            </div>
          );
        })}
      </div>

      <div className={styles.footerLinks}>
        <Link to="/user/my-courses" className={styles.browseLink}>
          View all my courses →
        </Link>
        <Link to="/user/courses" className={styles.browseLink}>
          Browse more courses →
        </Link>
      </div>
    </section>
  );
}

export default MyCourses;
