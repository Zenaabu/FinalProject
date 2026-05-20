// ─── CourseDetailManager.jsx ──────────────────────────────────────────────────
// Detail view for a single selected course.
// Renders a "← Back" button and a two-column CSS Grid:
//   Left column  → CourseEditForm  (edit course metadata)
//   Right column → LessonList      (view & edit individual lessons)
// ──────────────────────────────────────────────────────────────────────────────

import CourseEditForm from "../CourseEditForm/CourseEditForm";
import LessonList from "../LessonList/LessonList";
import styles from "./CourseDetailManager.module.css";

function CourseDetailManager({ course, onBack, onCourseUpdate }) {
  return (
    <div className={styles.wrapper}>
      {/* ── Back navigation ───────────────────────────────────────── */}
      <button className={styles.btnBack} type="button" onClick={onBack}>
        ← Back to All Courses
      </button>

      {/* ── Course name subtitle ──────────────────────────────────── */}
      <h2 className={styles.courseTitle}>{course.name}</h2>

      {/* ── Two-column detail grid ────────────────────────────────── */}
      <div className={styles.detailGrid}>
        {/* Left: edit form */}
        <CourseEditForm course={course} onSave={onCourseUpdate} />

        {/* Right: lesson table */}
        <LessonList courseId={course.id} courseName={course.name} />
      </div>
    </div>
  );
}

export default CourseDetailManager;
