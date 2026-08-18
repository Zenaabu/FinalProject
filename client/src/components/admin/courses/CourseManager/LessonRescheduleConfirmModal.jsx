// ─── LessonRescheduleConfirmModal.jsx ──────────────────────────────────────
// Confirmation pop-up shown before saving a lesson date/time change.
// Lists the students who will be emailed about the new schedule, plus the
// instructor actually teaching it (substitute if one covers it).
// Props:
//   students       – roster array ({ user_id, name, email }) to be notified
//   instructorName – display name of the instructor who will be emailed
//   onConfirm      – fn() called when admin clicks "Save & Notify"
//   onClose        – fn() called when admin cancels / closes overlay
//   saving         – true while the save request is in flight
// ──────────────────────────────────────────────────────────────────────────

import styles from "./LessonRescheduleConfirmModal.module.css";

function MailIcon() {
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
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LessonRescheduleConfirmModal({
  students,
  instructorName,
  onConfirm,
  onClose,
  saving,
}) {
  const roster = students ?? [];

  return (
    <div
      className={styles.overlay}
      onClick={saving ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <MailIcon />
        </div>

        <h2 className={styles.title}>Notify Students of New Schedule</h2>
        <p className={styles.message}>
          This lesson's date or time is changing. The{" "}
          <strong>{roster.length}</strong>{" "}
          {roster.length === 1 ? "student" : "students"} below will get an email
          with the new time as soon as you save.
          {instructorName && (
            <>
              {" "}
              <strong>{instructorName}</strong> will also be emailed, since
              they're the instructor teaching this lesson.
            </>
          )}
        </p>

        {roster.length > 0 ? (
          <ul className={styles.studentList}>
            {roster.map((s) => (
              <li key={s.user_id} className={styles.studentItem}>
                <span className={styles.studentName}>{s.name}</span>
                <span className={styles.studentEmail}>{s.email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyNote}>
            No students are registered to this course yet — nobody will be
            emailed.
          </p>
        )}

        <div className={styles.footer}>
          <button
            className={styles.btnCancel}
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className={styles.btnConfirm}
            type="button"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save & Notify"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LessonRescheduleConfirmModal;
