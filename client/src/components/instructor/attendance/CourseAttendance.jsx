// ─── CourseAttendance.jsx ─────────────────────────────────────────────────────
// /instructor/courses/:course_id
// Left: the lessons of the course. Right: the roster of the selected lesson,
// where the instructor marks every student present or absent and saves.
//
//   GET  /api/instructor/courses/:course_id/details      -> course + lessons
//   GET  /api/instructor/lessons/:lesson_id/attendance   -> roster + statuses
//   POST /api/instructor/lessons/:lesson_id/attendance   -> save the roster
//
// The server only accepts attendance once the lesson has started and while the
// course has not ended (can_take_attendance), so the Save button follows that.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import styles from "./CourseAttendance.module.css";

function CourseAttendance() {
  const { course_id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [lessonInfo, setLessonInfo] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── Load the course and its lessons ──────────────────────────────────────
  useEffect(() => {
    fetch(`/api/instructor/courses/${course_id}/details`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load the course");
        }
        setCourse(data.course);

        // open the first lesson by default
        if (data.course?.lessons?.length) {
          setSelectedLessonId(data.course.lessons[0].lesson_id);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [course_id]);

  // ── Load the roster of the selected lesson ───────────────────────────────
  const loadRoster = useCallback(async (lessonId) => {
    setRosterLoading(true);
    setRosterError(null);

    try {
      const res = await fetch(`/api/instructor/lessons/${lessonId}/attendance`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load the roster");
      }

      setLessonInfo(data.lesson);
      // a student who was never marked defaults to present — the instructor
      // then only has to flip the ones who did not show up
      setRoster(
        data.students.map((s) => ({
          ...s,
          attended: s.attendance_status ?? "present",
        })),
      );
    } catch (err) {
      setRosterError(err.message);
      setRoster([]);
      setLessonInfo(null);
    } finally {
      setRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLessonId) loadRoster(selectedLessonId);
  }, [selectedLessonId, loadRoster]);

  // ── Mark one student ─────────────────────────────────────────────────────
  const setAttendance = (user_id, attended) => {
    setRoster((prev) =>
      prev.map((s) => (s.user_id === user_id ? { ...s, attended } : s)),
    );
  };

  const markAll = (attended) => {
    setRoster((prev) => prev.map((s) => ({ ...s, attended })));
  };

  // ── Save the whole lesson ────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setRosterError(null);

    try {
      const res = await fetch(
        `/api/instructor/lessons/${selectedLessonId}/attendance`,
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
      setRosterError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.state}>Loading course…</div>;
  if (error) return <div className={styles.stateError}>Error: {error}</div>;
  if (!course) return <div className={styles.state}>Course not found.</div>;

  const presentCount = roster.filter((s) => s.attended === "present").length;
  const canSave =
    lessonInfo?.can_take_attendance && roster.length > 0 && !saving;

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <Link to="/instructor" className={styles.back}>
          ← My Courses
        </Link>
        <h1 className={styles.title}>{course.title}</h1>
        <p className={styles.subtitle}>
          {course.start_date} – {course.end_date} · {course.enrolled} /{" "}
          {course.capacity} enrolled
        </p>
      </div>

      <div className={styles.split}>
        {/* ── Lesson picker ─────────────────────────────────────────── */}
        <aside className={styles.lessonPane}>
          <h2 className={styles.paneTitle}>
            Lessons ({course.lessons.length})
          </h2>

          {course.lessons.length === 0 ? (
            <p className={styles.paneEmpty}>
              No lessons have been scheduled for this course yet.
            </p>
          ) : (
            <ul className={styles.lessonList}>
              {course.lessons.map((lesson) => {
                const isActive = lesson.lesson_id === selectedLessonId;
                const marked = lesson.students.filter(
                  (s) => s.attendance_status,
                ).length;

                return (
                  <li key={lesson.lesson_id}>
                    <button
                      type="button"
                      className={`${styles.lessonBtn} ${isActive ? styles.lessonBtnActive : ""}`}
                      onClick={() => setSelectedLessonId(lesson.lesson_id)}
                    >
                      <span className={styles.lessonName}>
                        Lesson {lesson.lesson_number}
                      </span>
                      <span className={styles.lessonWhen}>
                        {lesson.date} · {lesson.start_time}–{lesson.end_time}
                      </span>
                      <span className={styles.lessonMark}>
                        {marked > 0
                          ? `${marked} marked`
                          : "attendance not taken"}
                      </span>
                      {lesson.substitute_name && (
                        <span className={styles.changedTag}>
                          Covered by {lesson.substitute_name}
                        </span>
                      )}
                      {lesson.last_change?.change_type === "rescheduled" && (
                        <span className={styles.changedTag}>Rescheduled</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* ── Roster ────────────────────────────────────────────────── */}
        <section className={styles.rosterPane}>
          {!selectedLessonId ? (
            <p className={styles.paneEmpty}>Select a lesson on the left.</p>
          ) : rosterLoading ? (
            <p className={styles.paneEmpty}>Loading roster…</p>
          ) : (
            <>
              <div className={styles.rosterHeader}>
                <div>
                  <h2 className={styles.paneTitle}>
                    Lesson {lessonInfo?.lesson_number} attendance
                  </h2>
                  <p className={styles.rosterSub}>
                    {lessonInfo?.lesson_date} · {lessonInfo?.start_time}–
                    {lessonInfo?.end_time} · {presentCount} / {roster.length}{" "}
                    present
                  </p>
                </div>

                {roster.length > 0 && lessonInfo?.can_take_attendance && (
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
              </div>

              {/* surfaces the most recent reschedule / substitute change made
                  to this lesson, so the instructor doesn't miss it */}
              {lessonInfo?.last_change && (
                <p className={styles.changeNotice}>
                  This lesson was changed: {lessonInfo.last_change.details}
                </p>
              )}

              {/* the server refuses attendance outside the lesson window */}
              {lessonInfo && !lessonInfo.can_take_attendance && (
                <p className={styles.notice}>
                  Attendance can only be recorded once the lesson has started
                  and while the course is still running.
                </p>
              )}

              {rosterError && (
                <p className={styles.stateError} role="alert">
                  {rosterError}
                </p>
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
                                  disabled={!lessonInfo?.can_take_attendance}
                                  className={`${styles.toggleBtn} ${
                                    s.attended === value
                                      ? styles[`toggleBtn_${value}`]
                                      : ""
                                  }`}
                                  onClick={() =>
                                    setAttendance(s.user_id, value)
                                  }
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default CourseAttendance;
