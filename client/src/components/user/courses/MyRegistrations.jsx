// ─── MyRegistrations.jsx ───────────────────────────────────────────────────────
// /user/my-courses — every course the logged-in user has ever registered to,
// split into "Current & Upcoming" and "Previous" so finished courses don't get
// lost among the ones still running. Same data source as the compact widget
// on the dashboard (GET /api/courses/my-courses), just the full list.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { statusOf } from "../courseStatus";
import styles from "./MyRegistrations.module.css";

function CourseCard({ course }) {
  const status = statusOf(course);

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <span className={`${styles.badge} ${styles[`badge${status}`]}`}>
          {status}
        </span>
        <span className={`${styles.badge} ${styles.badgeLevel}`}>
          {course.level}
        </span>
      </div>

      <h3 className={styles.cardTitle}>{course.description}</h3>

      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt>Dates</dt>
          <dd>
            {course.start_date} – {course.end_date}
          </dd>
        </div>
        <div className={styles.metaRow}>
          <dt>Instructor</dt>
          <dd>{course.instructor}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt>Lessons</dt>
          <dd>{course.total_lessons}</dd>
        </div>
      </dl>

      <p className={styles.cardNextLesson}>
        {course.next_lesson
          ? `Next lesson: ${course.next_lesson.date} · ${course.next_lesson.start_time}–${course.next_lesson.end_time}`
          : status === "Finished"
            ? "This course has ended."
            : "No more lessons scheduled."}
      </p>
    </div>
  );
}

function MyRegistrations() {
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

  if (loading) return <div className={styles.state}>Loading your courses…</div>;
  if (error) return <div className={styles.stateError}>Error: {error}</div>;

  if (courses.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>My Courses</h1>
        </div>
        <div className={styles.state}>
          You haven't registered for any course yet.{" "}
          <Link to="/user/courses" className={styles.link}>
            Browse the catalog
          </Link>
          .
        </div>
      </div>
    );
  }

  const current = courses.filter((c) => statusOf(c) !== "Finished");
  const previous = courses.filter((c) => statusOf(c) === "Finished");

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>My Courses</h1>
        <p className={styles.subtitle}>
          Every course you've registered for, current and previous.
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Current &amp; Upcoming</h2>
        {current.length === 0 ? (
          <p className={styles.sectionEmpty}>
            No current or upcoming courses.
          </p>
        ) : (
          <div className={styles.grid}>
            {current.map((c) => (
              <CourseCard key={c.course_id} course={c} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Previous</h2>
        {previous.length === 0 ? (
          <p className={styles.sectionEmpty}>No previous courses yet.</p>
        ) : (
          <div className={styles.grid}>
            {previous.map((c) => (
              <CourseCard key={c.course_id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MyRegistrations;
