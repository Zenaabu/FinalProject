// ─── MyRegistrations.jsx ───────────────────────────────────────────────────────
// /user/my-courses — every course the logged-in user has ever registered to,
// split into "Current & Upcoming" and "Previous" so finished courses don't get
// lost among the ones still running. Same data source as the compact widget
// on the dashboard (GET /api/courses/my-courses), just the full list — each
// course card can expand to show every one of its lessons (not just the next
// one), since the API also returns the full `lessons` array per course.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { statusOf } from "../courseStatus";
import styles from "./MyRegistrations.module.css";

// a lesson is "Completed" once its end time has passed, otherwise "Upcoming"
function lessonStatus(lesson) {
  const end = new Date(`${lesson.date}T${lesson.end_time}:00`);
  return end < new Date() ? "Completed" : "Upcoming";
}

function CourseCard({ course }) {
  const status = statusOf(course);
  const [isExpanded, setIsExpanded] = useState(false);
  const lessons = course.lessons ?? [];

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

      {lessons.length > 0 && (
        <>
          <button
            type="button"
            className={styles.lessonsToggle}
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <ChevronDown
              size={14}
              className={`${styles.toggleIcon} ${isExpanded ? styles.toggleIconOpen : ""}`}
            />
            {isExpanded
              ? "Hide all lessons"
              : `View all lessons (${lessons.length})`}
          </button>

          {isExpanded && (
            <ul className={styles.lessonsList}>
              {lessons.map((lesson) => {
                const lStatus = lessonStatus(lesson);
                return (
                  <li key={lesson.lesson_id} className={styles.lessonRow}>
                    <span className={styles.lessonNumber}>
                      #{lesson.lesson_number}
                    </span>
                    <span className={styles.lessonDate}>{lesson.date}</span>
                    <span className={styles.lessonTime}>
                      {lesson.start_time}–{lesson.end_time}
                    </span>
                    <span
                      className={`${styles.lessonStatus} ${
                        lStatus === "Completed"
                          ? styles.lessonStatusDone
                          : styles.lessonStatusUpcoming
                      }`}
                    >
                      {lStatus}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
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
