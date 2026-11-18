// ─── EmptyCourseModal.jsx ─────────────────────────────────────────────────────
// Pop-up opened from the "No students" badge on CourseHeaderCard. That badge
// only shows when the server flags the course with is_empty_alert (active,
// at its last enrollment day or already started, nobody registered or
// mid-checkout — courseQueries.EMPTY_COURSE_CONDITION).
//
// The admin can keep the course as-is, or deactivate it:
// POST /api/courses/:course_id/deactivate-empty sets it inactive, which frees
// the instructor's time slots (every conflict check ignores inactive
// courses). The server re-checks the course is still empty, and responds
// with the fresh course, handed to onSaved() like every other course edit.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { formatDate } from "../../../../utils/formatDate";
import styles from "./EmptyCourseModal.module.css";

function UsersOffIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="23" y2="14" />
      <line x1="23" y1="8" x2="17" y2="14" />
    </svg>
  );
}

// today's date as YYYY-MM-DD in local time — lesson dates are plain strings
// (dateStrings: true on the pool), so they compare directly
function todayString() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function startLabel(daysUntilStart) {
  if (daysUntilStart > 1) return `Starts in ${daysUntilStart} days`;
  if (daysUntilStart === 1) return "Starts tomorrow — last day to enroll";
  if (daysUntilStart === 0) return "Starts today";
  const ago = Math.abs(daysUntilStart);
  return `Started ${ago} day${ago === 1 ? "" : "s"} ago`;
}

function EmptyCourseModal({ course, daysUntilStart, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const today = todayString();
  const upcomingLessons = (course.lessons || []).filter(
    (l) => l.date >= today,
  ).length;

  const deactivate = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/courses/${course.course_id}/deactivate-empty`,
        { method: "POST" },
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to deactivate the course.");
      }

      onSaved?.(data.course, data.message);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={saving ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="empty-course-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <UsersOffIcon />
        </div>

        <h2 id="empty-course-title" className={styles.title}>
          No students enrolled
        </h2>
        <p className={styles.message}>
          Nobody has signed up for this course and enrollment is closing. You
          can keep it running, or deactivate it and free the instructor.
        </p>

        {/* ── Course summary ─────────────────────────────────────────── */}
        <div className={styles.summary}>
          <div className={styles.summaryTitle}>{course.title}</div>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>Dates</dt>
              <dd>
                {formatDate(course.start_date)} – {formatDate(course.end_date)}
              </dd>
            </div>
            <div className={styles.fact}>
              <dt>Instructor</dt>
              <dd>{course.instructor}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Enrolled</dt>
              <dd className={styles.zero}>
                {course.enrolled} / {course.capacity}
              </dd>
            </div>
            <div className={styles.fact}>
              <dt>Status</dt>
              <dd>{startLabel(daysUntilStart)}</dd>
            </div>
          </dl>
        </div>

        {/* ── What deactivating does ─────────────────────────────────── */}
        <ul className={styles.effects}>
          <li>The course moves to Inactive and leaves the catalog.</li>
          <li>
            {course.instructor}'s {upcomingLessons} upcoming lesson
            {upcomingLessons === 1 ? "" : "s"} no longer block their schedule,
            so they can be assigned to another course.
          </li>
        </ul>

        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        <div className={styles.footer}>
          <button
            className={styles.btnCancel}
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Keep Course
          </button>
          <button
            className={styles.btnDeactivate}
            type="button"
            onClick={deactivate}
            disabled={saving}
          >
            {saving ? "Deactivating…" : "Deactivate Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmptyCourseModal;
