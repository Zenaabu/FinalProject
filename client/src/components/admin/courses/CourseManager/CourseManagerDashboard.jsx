// ─── CourseManagerDashboard.jsx ───────────────────────────────────────────────
// Renders the vertical accordion course view.
// The course data itself is owned by CoursesMain so that creating or editing a
// course can refresh this list.
// ──────────────────────────────────────────────────────────────────────────────

import CourseHeaderCard from "./CourseHeaderCard";
import styles from "./CourseManagerDashboard.module.css";

function CourseManagerDashboard({
  courses,
  instructors,
  loading,
  error,
  onCourseUpdated,
  onLessonsChanged,
}) {
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
      {courses.map((course) => (
        <CourseHeaderCard
          key={course.course_id}
          course={course}
          instructors={instructors}
          onCourseUpdated={onCourseUpdated}
          onLessonsChanged={onLessonsChanged}
        />
      ))}
    </div>
  );
}

export default CourseManagerDashboard;
