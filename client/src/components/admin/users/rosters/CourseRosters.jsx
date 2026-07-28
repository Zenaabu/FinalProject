// ─── CourseRosters.jsx ────────────────────────────────────────────────────────
// Child view 2: shows the enrolled-student list for a selected course.
// The dropdown controls which course's roster is displayed.
//
//   GET /api/courses/details                    — populates the course dropdown
//   GET /api/courses/:course_id/registrations   — the roster for the selected one
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import AvatarInitials from "../../dashboard/shared/AvatarInitials";
import styles from "./CourseRosters.module.css";

function CourseRosters() {
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);

  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState(null);

  // ── Load every course for the dropdown ───────────────────────────────────
  useEffect(() => {
    fetch("/api/courses/details")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load courses");
        }
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedId(data.courses[0].course_id);
        }
      })
      .catch((err) => setCoursesError(err.message))
      .finally(() => setCoursesLoading(false));
  }, []);

  // ── Load the roster whenever the selected course changes ─────────────────
  const loadRoster = useCallback((courseId) => {
    setRosterLoading(true);
    setRosterError(null);

    fetch(`/api/courses/${courseId}/registrations`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load the roster");
        }
        setRoster(data.registrations);
      })
      .catch((err) => setRosterError(err.message))
      .finally(() => setRosterLoading(false));
  }, []);

  useEffect(() => {
    if (selectedId) loadRoster(selectedId);
  }, [selectedId, loadRoster]);

  if (coursesLoading) {
    return <div className={styles.state}>Loading courses…</div>;
  }

  if (coursesError) {
    return <div className={styles.stateError}>Error: {coursesError}</div>;
  }

  if (courses.length === 0) {
    return <div className={styles.state}>No courses have been created yet.</div>;
  }

  const selected = courses.find((c) => c.course_id === selectedId);

  return (
    <div className={styles.card}>
      {/* ── Course selector ──────────────────────────────────────────── */}
      <div className={styles.selectorRow}>
        <label htmlFor="course-select" className={styles.selectorLabel}>
          Select Course
        </label>
        <select
          id="course-select"
          className={styles.select}
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          {courses.map((c) => (
            <option key={c.course_id} value={c.course_id}>
              {c.title} ({c.level})
            </option>
          ))}
        </select>
      </div>

      {/* ── Roster meta bar ──────────────────────────────────────────── */}
      {selected && (
        <div className={styles.rosterMeta}>
          <span className={styles.courseName}>{selected.title}</span>
          <span className={styles.count}>
            {selected.enrolled} / {selected.capacity} enrolled
          </span>
        </div>
      )}

      {/* ── Roster table ─────────────────────────────────────────────── */}
      {rosterLoading ? (
        <div className={styles.state}>Loading roster…</div>
      ) : rosterError ? (
        <div className={styles.stateError}>Error: {rosterError}</div>
      ) : roster.length === 0 ? (
        <div className={styles.state}>No students registered yet.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Participant Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => {
                const name = `${s.first_name} ${s.last_name}`;

                return (
                  <tr key={s.user_id} className={styles.row}>
                    <td>
                      <div className={styles.nameCell}>
                        <AvatarInitials name={name} size={32} />
                        <span className={styles.name}>{name}</span>
                      </div>
                    </td>
                    <td className={styles.phone}>{s.phone}</td>
                    <td className={styles.email}>{s.email}</td>
                    <td className={styles.date}>{s.payment_date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CourseRosters;
