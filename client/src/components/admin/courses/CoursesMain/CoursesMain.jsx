// ─── CoursesMain.jsx ──────────────────────────────────────────────────────────
// Parent container for /admin/courses.
// Owns the course list and the instructor list so that creating or editing a
// course refreshes the accordion below without a page reload, and so the
// instructor dropdown is fetched once instead of once per course card.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import CourseManagerDashboard from "../CourseManager/CourseManagerDashboard";
import CourseCreateForm from "../CourseCreateForm/CourseCreateForm";
import styles from "./CoursesMain.module.css";

function CoursesMain() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load every course with its lessons and attendance ────────────────────
  const loadCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses/details");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load courses");
      }

      setCourses(data.courses);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // ── Load the instructor dropdown options once ────────────────────────────
  useEffect(() => {
    fetch("/api/admin/instructors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInstructors(data.instructors);
      })
      .catch(() => {
        // non-blocking: the dropdowns just stay empty
      });
  }, []);

  // ── POST /api/courses returned the new course — prepend it ───────────────
  const handleCourseCreated = (newCourse) => {
    setShowCreateForm(false);
    toast.success("Course created successfully");

    if (newCourse) {
      setCourses((prev) => [newCourse, ...prev]);
    } else {
      loadCourses();
    }
  };

  // ── PUT /api/courses/:id returned the fresh course — swap it in ──────────
  const handleCourseUpdated = (updatedCourse) => {
    toast.success("Course updated successfully");

    setCourses((prev) =>
      prev.map((c) =>
        c.course_id === updatedCourse.course_id ? updatedCourse : c,
      ),
    );
  };

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
            instructors={instructors}
            onCancel={() => setShowCreateForm(false)}
            onCreated={handleCourseCreated}
          />
        </div>
      )}

      {/* ── Course list ────────────────────────────────────────────── */}
      <CourseManagerDashboard
        courses={courses}
        instructors={instructors}
        loading={loading}
        error={error}
        onCourseUpdated={handleCourseUpdated}
        onLessonsChanged={loadCourses}
      />
    </div>
  );
}

export default CoursesMain;
