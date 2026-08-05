// ─── SubstituteLessonAttendance.jsx ───────────────────────────────────────────
// /instructor/substitute-lessons/:lesson_id
// Attendance for a single lesson the logged-in instructor is covering as a
// substitute. Unlike CourseAttendance (the course owner's view), this page
// never shows the rest of the course — a substitute only has access to the
// one lesson they were assigned, not the owning instructor's full roster.
//
//   GET  /api/instructor/lessons/:lesson_id/attendance -> lesson + roster
//   POST /api/instructor/lessons/:lesson_id/attendance -> save the roster
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import styles from "./SubstituteLessonAttendance.module.css";

function SubstituteLessonAttendance() {
  const { lesson_id } = useParams();

  const [lessonInfo, setLessonInfo] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/instructor/lessons/${lesson_id}/attendance`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load the roster");
        }
        setLessonInfo(data.lesson);
        // a student who was never marked defaults to present — the
        // instructor then only has to flip the ones who did not show up
        setRoster(
          data.students.map((s) => ({
            ...s,
            attended: s.attendance_status ?? "present",
          })),
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lesson_id]);

  useEffect(() => {
    load();
  }, [load]);

  const setAttendance = (user_id, attended) => {
    setRoster((prev) =>
      prev.map((s) => (s.user_id === user_id ? { ...s, attended } : s)),
    );
  };

  const markAll = (attended) => {
    setRoster((prev) => prev.map((s) => ({ ...s, attended })));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/instructor/lessons/${lesson_id}/attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            records: roster.map((s) => ({
              user_id: s.user_id,
              attended: s.attended,
            })),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save attendance");
      }

      toast.success("Attendance saved");
      setRoster(
        data.students.map((s) => ({
          ...s,
          attended: s.attendance_status ?? "present",
        })),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.state}>Loading lesson…</div>;
  if (error) return <div className={styles.stateError}>Error: {error}</div>;
  if (!lessonInfo) return <div className={styles.state}>Lesson not found.</div>;

  const presentCount = roster.filter((s) => s.attended === "present").length;
  const canSave = lessonInfo.can_take_attendance && roster.length > 0 && !saving;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link to="/instructor/substitute-lessons" className={styles.back}>
          ← Substitute Lessons
        </Link>
        <span className={styles.badge}>You're covering this lesson</span>
        <h1 className={styles.title}>{lessonInfo.course_description}</h1>
        <p className={styles.subtitle}>
          Lesson {lessonInfo.lesson_number} · {lessonInfo.lesson_date} ·{" "}
          {lessonInfo.start_time}–{lessonInfo.end_time} · {presentCount} /{" "}
          {roster.length} present
        </p>
      </div>

      {lessonInfo.last_change && (
        <p className={styles.changeNotice}>
          This lesson was changed: {lessonInfo.last_change.details}
        </p>
      )}

      {!lessonInfo.can_take_attendance && (
        <p className={styles.notice}>
          Attendance can only be recorded once the lesson has started and
          while the course is still running.
        </p>
      )}

      {roster.length > 0 && lessonInfo.can_take_attendance && (
        <div className={styles.bulkActions}>
          <button
            type="button"
            className={styles.bulkBtn}
            onClick={() => markAll("present")}
          >
            All present
          </button>
          <button
            type="button"
            className={styles.bulkBtn}
            onClick={() => markAll("absent")}
          >
            All absent
          </button>
        </div>
      )}

      {roster.length === 0 ? (
        <p className={styles.paneEmpty}>
          No students are registered to this course yet.
        </p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th className={styles.colStatus}>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => (
                <tr key={s.user_id}>
                  <td className={styles.nameCell}>
                    {s.first_name} {s.last_name}
                    {!s.attendance_status && (
                      <span className={styles.newTag}>not marked</span>
                    )}
                  </td>
                  <td className={styles.emailCell}>{s.email}</td>
                  <td>
                    <div className={styles.toggle}>
                      {["present", "absent"].map((value) => (
                        <button
                          key={value}
                          type="button"
                          disabled={!lessonInfo.can_take_attendance}
                          className={`${styles.toggleBtn} ${
                            s.attended === value
                              ? styles[`toggleBtn_${value}`]
                              : ""
                          }`}
                          onClick={() => setAttendance(s.user_id, value)}
                        >
                          {value === "present" ? "Present" : "Absent"}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.saveRow}>
            <button
              type="button"
              className={`btn-primary ${styles.btnSave}`}
              onClick={handleSave}
              disabled={!canSave}
            >
              {saving ? "Saving…" : "Save attendance"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SubstituteLessonAttendance;
