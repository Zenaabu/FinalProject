// ─── MyCourses.jsx ─────────────────────────────────────────────────────────────
// Rendered on the user dashboard, below the weather widget.
//
//   GET /api/courses/my-courses — every course the user is registered to,
//   each with its next upcoming lesson (or null once the course is done).
//
// "This Week's Lessons" shows at most ONE bar per enrolled course — that
// course's next_lesson, and only if it's due within 7 days. Deliberately not
// every lesson in that window: a course with lessons on back-to-back days
// would otherwise dump all of them on the student at once, which defeats the
// point (surface what's coming up next, not the whole schedule). The next
// lesson only appears here once the current one is done.
//
// Enrolled in nothing yet -> show the same three marketing plan cards as the
// landing page, but pointed at the course catalog pre-filtered to that level
// instead of /signup (the user is already logged in).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, GraduationCap } from "lucide-react";
import CourseCard from "../../landing/sections/courses/CourseCard";
import { COURSES } from "../../landing/sections/courses/coursesData";
import { statusOf } from "../courseStatus";
import styles from "./MyCourses.module.css";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// courses whose next_lesson starts within the next 7 days, one entry each —
// never more than one lesson per course
function lessonsThisWeek(courses) {
  const cutoff = new Date(Date.now() + WEEK_MS);

  return courses
    .filter((c) => c.next_lesson)
    .filter(
      (c) =>
        new Date(`${c.next_lesson.date}T${c.next_lesson.start_time}:00`) <=
        cutoff,
    )
    .sort(
      (a, b) =>
        new Date(`${a.next_lesson.date}T${a.next_lesson.start_time}:00`) -
        new Date(`${b.next_lesson.date}T${b.next_lesson.start_time}:00`),
    );
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
  const thisWeek = lessonsThisWeek(courses);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>My Courses</h2>
      </div>

      {/* ── Panel 1: this week's lessons — one bar per course, its next lesson only ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <CalendarClock size={18} className={styles.panelIcon} />
          <h3 className={styles.panelTitle}>This Week's Lessons</h3>
        </div>

        {thisWeek.length > 0 ? (
          <div className={styles.weekLessonsRow}>
            {thisWeek.map((course) => (
              <div key={course.course_id} className={styles.weekLessonBar}>
                <span className={styles.weekLessonTag}>Upcoming Lesson</span>
                <p className={styles.weekLessonCourse}>{course.description}</p>
                <p className={styles.weekLessonWhen}>
                  {course.next_lesson.date} · {course.next_lesson.start_time}–
                  {course.next_lesson.end_time}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.nextLessonCardEmpty}>
            You have no lessons scheduled in the next 7 days.
          </div>
        )}
      </div>

      {/* ── Panel 2: every course the student is enrolled in ────────────── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <GraduationCap size={18} className={styles.panelIcon} />
          <h3 className={styles.panelTitle}>My Enrolled Courses</h3>
        </div>

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
