// ─── CoursesMain.jsx ──────────────────────────────────────────────────────────
// Parent container for /admin/courses.
// Renders the CourseManagerDashboard (vertical accordion view).
// Toggles CourseCreateForm when the user clicks "+ New Course".
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import CourseManagerDashboard from "../CourseManager/CourseManagerDashboard";
import CourseCreateForm from "../CourseCreateForm/CourseCreateForm";
import styles from "./CoursesMain.module.css";

function CoursesMain() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className={styles.page}>
      {/* ── Page header row ────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Courses &amp; Lessons</h1>
        <button
          className={`btn-primary ${styles.btnNewCourse}`}
          onClick={() => setShowCreateForm(true)}
        >
          + New Course
        </button>
      </div>

      {/* ── Create form (shown on demand) ──────────────────────────── */}
      {showCreateForm && (
        <div className={styles.formWrapper}>
          <CourseCreateForm
            onCancel={() => setShowCreateForm(false)}
            onCreated={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* ── Course list ────────────────────────────────────────────── */}
      <CourseManagerDashboard />
    </div>
  );
}

export default CoursesMain;
