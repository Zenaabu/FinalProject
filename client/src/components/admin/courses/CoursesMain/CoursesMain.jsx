// ─── CoursesMain.jsx ──────────────────────────────────────────────────────────
// Parent container for /admin/courses.
// Renders the CourseManagerDashboard (vertical accordion view).
// ──────────────────────────────────────────────────────────────────────────────

import CourseManagerDashboard from "../CourseManager/CourseManagerDashboard";
import styles from "./CoursesMain.module.css";

function CoursesMain() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Courses &amp; Lessons</h1>
      <CourseManagerDashboard />
    </div>
  );
}

export default CoursesMain;
