// ─── CourseManagerDashboard.jsx ───────────────────────────────────────────────
// Renders the vertical accordion course view, split by status into an
// All / Active / Inactive tab filter (an "Active"/"Upcoming" course counts as
// Active — both mean is_active = 1 on the course row; only a course the
// backend has flipped to is_active = 0, i.e. status "Inactive", counts
// against the Inactive tab).
// The course data itself is owned by CoursesMain so that creating or editing a
// course can refresh this list.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import CourseHeaderCard from "./CourseHeaderCard";
import styles from "./CourseManagerDashboard.module.css";

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const EMPTY_MESSAGE = {
  all: "No courses found.",
  active: "No active courses right now.",
  inactive: "No inactive courses — nothing has finished yet.",
};

function CourseManagerDashboard({
  courses,
  instructors,
  loading,
  error,
  onCourseUpdated,
  onLessonsChanged,
}) {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(() => {
    const inactive = courses.filter((c) => c.status === "Inactive").length;
    return {
      all: courses.length,
      active: courses.length - inactive,
      inactive,
    };
  }, [courses]);

  const visibleCourses = useMemo(() => {
    if (filter === "active") {
      return courses.filter((c) => c.status !== "Inactive");
    }
    if (filter === "inactive") {
      return courses.filter((c) => c.status === "Inactive");
    }
    return courses;
  }, [courses, filter]);

  if (loading) {
    return <div className={styles.state}>Loading courses…</div>;
  }

  if (error) {
    return <div className={styles.stateError}>Error: {error}</div>;
  }

  if (courses.length === 0) {
    return <div className={styles.state}>No courses found.</div>;
  }

  return (
    <div className={styles.dashboard}>
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

      {/* ── Course list (filtered) ───────────────────────────────────── */}
      {visibleCourses.length === 0 ? (
        <div className={styles.state}>{EMPTY_MESSAGE[filter]}</div>
      ) : (
        visibleCourses.map((course) => (
          <CourseHeaderCard
            key={course.course_id}
            course={course}
            instructors={instructors}
            onCourseUpdated={onCourseUpdated}
            onLessonsChanged={onLessonsChanged}
          />
        ))
      )}
    </div>
  );
}

export default CourseManagerDashboard;
