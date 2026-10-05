// ─── EnrollConfirmModal.jsx ───────────────────────────────────────────────────
// Confirmation pop-up shown before a student is sent to PayPal. Lists every
// lesson date/time for the course so they can check it fits their schedule
// before paying, instead of the old one-click "Enroll now" -> PayPal redirect.
// Props:
//   course     – the course object from GET /api/courses/available (must
//                include its `lessons` array)
//   onConfirm  – fn() called when the student clicks "Continue to PayPal"
//   onClose    – fn() called when they cancel / close the overlay
//   submitting – true while the create-order request is in flight
// ──────────────────────────────────────────────────────────────────────────────

import { CalendarDays } from "lucide-react";
import styles from "./EnrollConfirmModal.module.css";

function EnrollConfirmModal({ course, onConfirm, onClose, submitting }) {
  const lessons = course.lessons ?? [];

  return (
    <div
      className={styles.overlay}
      onClick={submitting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <CalendarDays size={26} />
        </div>

        <h2 className={styles.title}>Confirm Enrollment</h2>
        <p className={styles.message}>
          Before you pay, check that every lesson date works for you.
        </p>

        <div className={styles.summary}>
          <div className={styles.summaryTitle}>{course.description}</div>
          <div className={styles.summaryMeta}>
            {course.level} &middot; Instructor: {course.instructor}
          </div>
        </div>

        {lessons.length > 0 ? (
          <ul className={styles.lessonList}>
            {lessons.map((l) => (
              <li key={l.lesson_id} className={styles.lessonItem}>
                <span className={styles.lessonNumber}>#{l.lesson_number}</span>
                <span className={styles.lessonDate}>{l.date}</span>
                <span className={styles.lessonTime}>
                  {l.start_time}–{l.end_time}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyNote}>
            No lesson dates have been scheduled for this course yet.
          </p>
        )}

        <div className={styles.priceRow}>
          <span>Total</span>
          {/* course.price is already VAT-inclusive — it's exactly what
              PayPal charges, so show it as one final price */}
          <span className={styles.price}>₪{course.price}</span>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.btnCancel}
            type="button"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className={styles.btnConfirm}
            type="button"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? "Redirecting to PayPal…" : "Continue to PayPal"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnrollConfirmModal;
