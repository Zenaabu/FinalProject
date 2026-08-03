// ─── LessonConflictModal.jsx ──────────────────────────────────────────────────
// Shown when an instructor tries to submit a time-off request that overlaps
// lessons they're scheduled to teach. Lists every affected lesson so they
// know exactly what they'd be missing before they decide.
// Props:
//   firstName      – instructor's first name, for the greeting
//   lessons        – [{ course_description, lesson_number, lesson_date,
//                       start_time, end_time }]
//   startDate      – requested range start (YYYY-MM-DD)
//   endDate        – requested range end (YYYY-MM-DD)
//   submitting     – true while the "submit anyway" request is in flight
//   onGoBack       – fn() called to dismiss and keep editing the form
//   onSubmitAnyway – fn() called to send the request despite the conflicts
// ──────────────────────────────────────────────────────────────────────────────

import { ArrowLeft, Send, Clock } from "lucide-react";
import styles from "./LessonConflictModal.module.css";

function LessonConflictModal({
  firstName,
  lessons,
  startDate,
  endDate,
  submitting,
  onGoBack,
  onSubmitAnyway,
}) {
  const rangeLabel =
    startDate === endDate ? startDate : `${startDate} – ${endDate}`;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {/* ── Wavy header ─────────────────────────────────────────────── */}
        <div className={styles.header}>
          <h2 className={styles.title}>Hold up, {firstName}</h2>
          <svg
            className={styles.wave}
            viewBox="0 0 500 40"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,20 C125,45 375,-5 500,20 L500,40 L0,40 Z" />
          </svg>
        </div>

        {/* ── Text ─────────────────────────────────────────────────────── */}
        <div className={styles.body}>
          <p className={styles.message}>
            You're scheduled to teach{" "}
            <strong>
              {lessons.length} lesson{lessons.length > 1 ? "s" : ""}
            </strong>{" "}
            during <strong>{rangeLabel}</strong>. If this request is
            approved, you won't be able to teach these:
          </p>

          <ul className={styles.lessonList}>
            {lessons.map((lesson) => (
              <li key={lesson.lesson_id} className={styles.lessonItem}>
                <span className={styles.lessonCourse}>
                  {lesson.course_description}
                </span>
                <span className={styles.lessonMeta}>
                  Lesson {lesson.lesson_number} · {lesson.lesson_date}
                  <span className={styles.lessonTime}>
                    <Clock size={14} />
                    {lesson.start_time}–{lesson.end_time}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className={styles.footnote}>
            You can still send the request — the admin will arrange a
            substitute or reschedule these lessons if it's approved.
          </p>
        </div>

        {/* ── Buttons ──────────────────────────────────────────────────── */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.btnBack}
            onClick={onGoBack}
            disabled={submitting}
          >
            <ArrowLeft size={16} />
            Go back
          </button>
          <button
            type="button"
            className={styles.btnSubmit}
            onClick={onSubmitAnyway}
            disabled={submitting}
          >
            <Send size={16} />
            {submitting ? "Sending…" : "Submit request anyway"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LessonConflictModal;
