// ─── AffectedLessonsPanel.jsx ─────────────────────────────────────────────
// Shown inside StaffPage when an approved constraint is expanded. Lists the
// lessons that fall inside that constraint's date range and lets the admin
// resolve each one: assign a substitute instructor, or reschedule it to a
// new date. Lessons are never cancelled.
//
// The decision is one-shot per lesson per constraint: once a lesson has any
// history entry logged against this constraint, the actions disappear for
// good and only the committed outcome (in the history log) is shown — no
// picking again, no clearing.
//
// A lesson that gets rescheduled outside the constraint's date range still
// shows up here (matched through its history), so a resolved lesson never
// just disappears.
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import styles from "./AffectedLessonsPanel.module.css";

function LessonRow({
  lesson,
  excludeInstructorId,
  instructors,
  constraintsId,
  onChanged,
}) {
  const [mode, setMode] = useState(null); // null | "substitute" | "reschedule"
  const [substitutePick, setSubstitutePick] = useState("");
  const [newDate, setNewDate] = useState(lesson.lesson_date);
  const [newStart, setNewStart] = useState(lesson.start_time);
  const [newEnd, setNewEnd] = useState(lesson.end_time);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Instructors who are actually free at this lesson's exact date/time —
  // fetched fresh each time the substitute form opens, instead of showing
  // every instructor and letting the admin discover a conflict only after
  // picking one and getting the "already teaches another lesson" error.
  const [availableInstructors, setAvailableInstructors] = useState(null);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // once anything has been logged for this lesson against this constraint,
  // the decision is final — no more actions, no clearing
  const isResolved = Boolean(lesson.history && lesson.history.length > 0);

  function closeForm() {
    setMode(null);
    setError(null);
  }

  // re-seed the edit form from the lesson's CURRENT values every time it's
  // opened — the row stays mounted across refetches (same key), so without
  // this a second edit would start from stale, already-overwritten values
  function openSubstitute() {
    setSubstitutePick(lesson.substitute_instructor_id || "");
    setError(null);
    setMode("substitute");
    setAvailableInstructors(null);
    setLoadingAvailable(true);

    const params = new URLSearchParams({
      date: lesson.lesson_date,
      start_time: lesson.start_time,
      end_time: lesson.end_time,
      exclude_instructor_id: excludeInstructorId,
    });

    fetch(`/api/admin/instructors/available-for-lesson?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(
            data.message || "Failed to load available instructors",
          );
        }
        setAvailableInstructors(data.instructors);
      })
      .catch(() => {
        // fall back to every instructor rather than blocking the admin
        // entirely — they'll still get the conflict error on submit if
        // they pick someone who turns out to be busy
        setAvailableInstructors(
          instructors.filter((i) => i.user_id !== excludeInstructorId),
        );
      })
      .finally(() => setLoadingAvailable(false));
  }

  function openReschedule() {
    setNewDate(lesson.lesson_date);
    setNewStart(lesson.start_time);
    setNewEnd(lesson.end_time);
    setError(null);
    setMode("reschedule");
  }

  function submitSubstitute() {
    if (!substitutePick) return;
    setSaving(true);
    setError(null);

    fetch(
      `/api/courses/${lesson.course_id}/lessons/${lesson.lesson_id}/substitute?constraints_id=${constraintsId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ substitute_instructor_id: substitutePick }),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.message);
          return;
        }
        toast.success("Substitute assigned");
        closeForm();
        onChanged();
      })
      .catch(() => setError("Failed to assign substitute"))
      .finally(() => setSaving(false));
  }

  function submitReschedule() {
    setSaving(true);
    setError(null);

    fetch(
      `/api/courses/${lesson.course_id}/lessons/${lesson.lesson_id}?constraints_id=${constraintsId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_date: newDate,
          start_time: newStart,
          end_time: newEnd,
        }),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.message);
          return;
        }
        toast.success(
          "Lesson rescheduled. Students still need to be notified manually for now.",
        );
        closeForm();
        onChanged();
      })
      .catch(() => setError("Failed to reschedule lesson"))
      .finally(() => setSaving(false));
  }

  return (
    <li className={styles.lessonItem}>
      <div className={styles.lessonInfo}>
        <span className={styles.lessonCourse}>{lesson.course_description}</span>
        <span className={styles.lessonMeta}>
          Lesson {lesson.lesson_number} · {lesson.lesson_date} ·{" "}
          {lesson.start_time}–{lesson.end_time}
        </span>
        {lesson.history && lesson.history.length > 0 && (
          <ul className={styles.historyLog}>
            {lesson.history.map((h, i) => (
              <li key={i}>
                {h.details}
                <span className={styles.historyWhen}>
                  {" "}
                  · {String(h.created_at).slice(0, 16).replace("T", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isResolved && (
        <div className={styles.lessonRight}>
          <span className={styles.coveredBadge}>
            {lesson.substitute_name
              ? `Covered by ${lesson.substitute_name}`
              : "Resolved"}
          </span>
        </div>
      )}

      {!isResolved && mode === null && (
        <div className={styles.lessonRight}>
          <span className={styles.unresolvedBadge}>Needs a decision</span>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={openSubstitute}
          >
            Assign substitute
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={openReschedule}
          >
            Reschedule
          </button>
        </div>
      )}

      {!isResolved && mode === "substitute" && (
        <div className={styles.inlineForm}>
          <select
            className={styles.select}
            value={substitutePick}
            onChange={(e) => setSubstitutePick(e.target.value)}
            disabled={loadingAvailable}
          >
            <option value="">
              {loadingAvailable
                ? "Checking availability…"
                : availableInstructors && availableInstructors.length === 0
                  ? "No one is free at this time"
                  : "Choose an instructor…"}
            </option>
            {(availableInstructors || []).map((i) => (
              <option key={i.user_id} value={i.user_id}>
                {i.first_name} {i.last_name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={submitSubstitute}
            disabled={!substitutePick || saving || loadingAvailable}
          >
            {saving ? "…" : "Assign"}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={closeForm}>
            ✕
          </button>
          {error && <span className={styles.errorText}>{error}</span>}
        </div>
      )}

      {!isResolved && mode === "reschedule" && (
        <div className={styles.inlineForm}>
          <input
            type="date"
            className={styles.dateInput}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <input
            type="time"
            className={styles.timeInput}
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
          />
          <input
            type="time"
            className={styles.timeInput}
            value={newEnd}
            onChange={(e) => setNewEnd(e.target.value)}
          />
          <button
            type="button"
            className={styles.saveBtn}
            onClick={submitReschedule}
            disabled={saving}
          >
            {saving ? "…" : "Save"}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={closeForm}>
            ✕
          </button>
          {error && <span className={styles.errorText}>{error}</span>}
        </div>
      )}
    </li>
  );
}

function AffectedLessonsPanel({
  constraintsId,
  originalInstructorId,
  instructors,
  onResolvedCountChange,
}) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/instructor-constraints/${constraintsId}/affected-lessons`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load affected lessons");
        }
        setLessons(data.lessons);
        // keeps the collapsed-row "still needs attention" badge on
        // StaffPage in sync as the admin resolves lessons one by one,
        // instead of it only refreshing on a full page reload
        onResolvedCountChange?.(
          data.lessons.filter((l) => !l.history || l.history.length === 0)
            .length,
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // onResolvedCountChange intentionally excluded: StaffPage passes a new
    // inline function every render, and including it here would recreate
    // `load` (and retrigger the effect below) on every StaffPage re-render —
    // including the very re-render this callback itself causes, which would
    // loop. constraintsId is the only thing that should ever re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constraintsId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className={styles.state}>Loading lessons…</div>;
  if (error) return <div className={styles.stateError}>{error}</div>;

  if (lessons.length === 0) {
    return (
      <div className={styles.state}>
        No lessons of this instructor fall inside these dates.
      </div>
    );
  }

  return (
    <ul className={styles.lessonList}>
      {lessons.map((lesson) => (
        <LessonRow
          key={lesson.lesson_id}
          lesson={lesson}
          excludeInstructorId={originalInstructorId}
          instructors={instructors}
          constraintsId={constraintsId}
          onChanged={load}
        />
      ))}
    </ul>
  );
}

export default AffectedLessonsPanel;
