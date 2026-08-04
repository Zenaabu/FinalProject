// ─── ApproveConflictModal.jsx ─────────────────────────────────────────────────
// Admin-facing mirror of the instructor's LessonConflictModal (same design).
// Shown right before an admin approves a constraint that overlaps lessons the
// instructor is scheduled to teach, so they see the impact before committing
// to the decision instead of discovering it afterward in the affected-lessons
// panel.
// Props:
//   instructorName – the requesting instructor's full name
//   lessons        – [{ lesson_id, course_description, lesson_number,
//                        lesson_date, start_time, end_time }]
//   startDate      – requested range start (YYYY-MM-DD)
//   endDate        – requested range end (YYYY-MM-DD)
//   submitting     – true while the "approve anyway" request is in flight
//   onGoBack       – fn() called to dismiss without approving
//   onApproveAnyway – fn() called to approve despite the conflicts
// ──────────────────────────────────────────────────────────────────────────────

import { ArrowLeft, Check, Clock } from "lucide-react";
import styles from "./ApproveConflictModal.module.css";

function ApproveConflictModal({
  instructorName,
  lessons,
  startDate,
  endDate,
  submitting,
  onGoBack,
  onApproveAnyway,
}) {
  const rangeLabel =
    startDate === endDate ? startDate : `${startDate} – ${endDate}`;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {/* ── Wavy header ─────────────────────────────────────────────── */}
        <div className={styles.header}>
          <h2 className={styles.title}>Before you approve</h2>
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
            <strong>{instructorName}</strong> is scheduled to teach{" "}
            <strong>
              {lessons.length} lesson{lessons.length > 1 ? "s" : ""}
            </strong>{" "}
            during <strong>{rangeLabel}</strong>. Approving this request means
            they won't be able to teach these:
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
            You can still approve — you'll assign a substitute or reschedule
            each lesson afterward from this page.
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
            className={styles.btnApprove}
            onClick={onApproveAnyway}
            disabled={submitting}
          >
            <Check size={16} />
            {submitting ? "Approving…" : "Approve anyway"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApproveConflictModal;
