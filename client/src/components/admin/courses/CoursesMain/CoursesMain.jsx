// ─── CoursesMain.jsx ──────────────────────────────────────────────────────────
// Parent container for /admin/courses.
// Manages the Master-Detail navigation state:
//   - selectedCourse === null  → renders CourseList  (master view)
//   - selectedCourse !== null  → renders CourseDetailManager (detail view)
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import CourseList from "../CourseList/CourseList";
import CourseDetailManager from "../CourseDetailManager/CourseDetailManager";
import styles from "./CoursesMain.module.css";

function CoursesMain() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Courses &amp; Lessons</h1>

      {selectedCourse === null ? (
        <CourseList onManage={(course) => setSelectedCourse(course)} />
      ) : (
        <CourseDetailManager
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
          onCourseUpdate={(updated) => setSelectedCourse(updated)}
        />
      )}
    </div>
  );
}

export default CoursesMain;
