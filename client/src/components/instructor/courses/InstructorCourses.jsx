// ─── InstructorCourses.jsx ────────────────────────────────────────────────────
// Landing page of /instructor — the courses this instructor teaches.
// Picking a course goes to /instructor/courses/:course_id, where the lessons
// and their attendance are handled.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./InstructorCourses.module.css";

function statusOf(course) {
  const today = new Date().toISOString().slice(0, 10);

  if (!course.is_active) return "Finished";
  if (course.start_date > today) return "Upcoming";
  if (course.end_date < today) return "Finished";
  return "Running";
}

const TABS = [
  { key: "Running", label: "Running" },
  { key: "Upcoming", label: "Upcoming" },
  { key: "Finished", label: "Finished" },
];

const EMPTY_MESSAGE = {
  Running: "No courses running right now.",
  Upcoming: "No upcoming courses.",
  Finished: "No finished courses yet.",
};

function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Running");

  useEffect(() => {
    fetch("/api/instructor/courses")
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

  const statusedCourses = useMemo(
    () => courses.map((course) => ({ ...course, status: statusOf(course) })),
    [courses],
  );

  const counts = useMemo(() => {
    return statusedCourses.reduce(
      (acc, course) => {
        acc[course.status] += 1;
        return acc;
      },
      { Running: 0, Upcoming: 0, Finished: 0 },
    );
  }, [statusedCourses]);

  const visibleCourses = useMemo(
    () => statusedCourses.filter((course) => course.status === filter),
    [statusedCourses, filter],
  );

  if (loading) return <div className={styles.state}>Loading your courses…</div>;
  if (error) return <div className={styles.stateError}>Error: {error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>My Courses</h1>
        <p className={styles.subtitle}>
          Choose a course to see its lessons and record attendance.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className={styles.state}>
          You are not assigned to any course yet.
        </div>
      ) : (
        <>
          {/* ── Status filter tabs ───────────────────────────────────────── */}
          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Filter courses by status"
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={filter === tab.key}
                className={`${styles.tab} ${filter === tab.key ? styles.tabActive : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                <span className={styles.tabCount}>{counts[tab.key]}</span>
              </button>
            ))}
          </div>

          {/* ── Course grid (filtered) ───────────────────────────────────── */}
          {visibleCourses.length === 0 ? (
            <div className={styles.state}>{EMPTY_MESSAGE[filter]}</div>
          ) : (
            <div className={styles.grid}>
              {visibleCourses.map((course) => (
                <Link
                  key={course.course_id}
                  to={`/instructor/courses/${course.course_id}`}
                  className={styles.card}
                >
                  <div className={styles.cardTop}>
                    <span
                      className={`${styles.badge} ${styles[`badge${course.status}`]}`}
                    >
                      {course.status}
                    </span>
                    <span className={`${styles.badge} ${styles.badgeLevel}`}>
                      {course.level}
                    </span>
                  </div>

                  <h2 className={styles.cardTitle}>{course.description}</h2>

                  <dl className={styles.meta}>
                    <div className={styles.metaRow}>
                      <dt>Dates</dt>
                      <dd>
                        {course.start_date} – {course.end_date}
                      </dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Lessons</dt>
                      <dd>
                        {course.lessons_count} of {course.total_lessons}{" "}
                        scheduled
                      </dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Students</dt>
                      <dd>
                        {course.enrolled} / {course.capacity} enrolled
                      </dd>
                    </div>
                  </dl>

                  <span className={styles.cta}>Take attendance →</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InstructorCourses;
