// ─── CourseManagerDashboard.jsx ───────────────────────────────────────────────
// Parent container for the vertical accordion course view.
// Fetches courses + lessons + attendance from the server.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import CourseHeaderCard from "./CourseHeaderCard";
import styles from "./CourseManagerDashboard.module.css";

function CourseManagerDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/courses/details")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success)
          throw new Error(data.message || "Failed to load courses");
        setCourses(data.courses);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.state}>Loading courses…</div>;
  }

  if (error) {
    return <div className={styles.stateError}>Error: {error}</div>;
  }

  if (courses.length === 0) {
    return <div className={styles.state}>No active courses found.</div>;
  }

  return (
    <div className={styles.dashboard}>
      {courses.map((course) => (
        <CourseHeaderCard
          key={course.course_id}
          course={course}
          onEditCourse={(updated) => {
            setCourses((prev) =>
              prev.map((c) =>
                c.course_id === updated.course_id ? { ...c, ...updated } : c,
              ),
            );
          }}
        />
      ))}
    </div>
  );
}

export default CourseManagerDashboard;
