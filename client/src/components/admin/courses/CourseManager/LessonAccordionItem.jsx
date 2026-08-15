// ─── LessonAccordionItem.jsx ──────────────────────────────────────────────────
// Single expandable lesson row. Clicking anywhere on the header toggles
// the AttendanceTable panel below it. Pencil opens inline edit form which
// PUTs to /api/courses/:course_id/lessons/:lesson_id.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import AttendanceTable from "./AttendanceTable";
import styles from "./LessonAccordionItem.module.css";

/* ── Inline SVG icons ────────────────────────────────────────────────────── */
function ChevronIcon({ expanded }) {
  return (
    <svg
      className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// students whose attendance has not been marked yet have a null status
function attendanceSummary(students) {
  const roster = students ?? [];

  if (roster.length === 0) return "no students enrolled";

  const marked = roster.filter((s) => s.attendance_status).length;

  if (marked === 0) return `${roster.length} enrolled · not marked yet`;

  const present = roster.filter(
    (s) => s.attendance_status === "present",
  ).length;

  return `${present} / ${roster.length} attended`;
}

function LessonAccordionItem({ lesson, courseId, onLessonsChanged }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    lesson_date: lesson.date ?? "",
    start_time: lesson.start_time ?? "",
    end_time: lesson.end_time ?? "",
  });

  const toggle = () => setIsExpanded((prev) => !prev);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // ── Save: PUT only the fields that actually changed ─────────────────────
  const handleSave = async () => {
    const body = {};
    if (form.lesson_date !== lesson.date) body.lesson_date = form.lesson_date;
    if (form.start_time !== lesson.start_time)
      body.start_time = form.start_time;
    if (form.end_time !== lesson.end_time) body.end_time = form.end_time;

    if (Object.keys(body).length === 0) {
      setError("Nothing changed.");
      return;
    }

    if (form.start_time >= form.end_time) {
      setError("Start time must be before end time.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/courses/${courseId}/lessons/${lesson.lesson_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update lesson.");
      }

      toast.success("Lesson updated successfully");
      setIsEditOpen(false);
      onLessonsChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      lesson_date: lesson.date ?? "",
      start_time: lesson.start_time ?? "",
      end_time: lesson.end_time ?? "",
    });
    setError(null);
    setIsEditOpen(false);
  };

  return (
    <div className={`${styles.item} ${isExpanded ? styles.itemExpanded : ""}`}>
      {/* ── Clickable header row ───────────────────────────────────── */}
      <div
        className={styles.header}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={toggle}
        onKeyDown={(e) => e.key === "Enter" && toggle()}
      >
        <ChevronIcon expanded={isExpanded} />

        <div className={styles.lessonInfo}>
          <div className={styles.lessonTitleRow}>
            <span className={styles.lessonNumber}>
              Lesson {lesson.lesson_number}
            </span>
          </div>
          <div className={styles.lessonMeta}>
            <span>{lesson.date}</span>
            <span className={styles.dot}>·</span>
            <span>
              {lesson.start_time} – {lesson.end_time}
            </span>
            <span className={styles.dot}>·</span>
            <span className={styles.attendanceSummary}>
              {attendanceSummary(lesson.students)}
            </span>
            {lesson.substitute_name && (
              <>
                <span className={styles.dot}>·</span>
                <span className={styles.coveredBadge}>
                  Covered by {lesson.substitute_name}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          className={`${styles.btnEdit} ${isEditOpen ? styles.btnEditActive : ""}`}
          type="button"
          aria-label="Edit lesson"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditOpen((prev) => !prev);
          }}
        >
          <PencilIcon />
        </button>
      </div>

      {/* ── Inline edit form ───────────────────────────────────────── */}
      {isEditOpen && (
        <div className={styles.editPanel}>
          <p className={styles.editTitle}>Edit Lesson Details</p>

          {error && (
            <p className={styles.editError} role="alert">
              {error}
            </p>
          )}

          <div className={styles.editGrid}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Date</label>
              <input
                type="date"
                className={styles.editInput}
                value={form.lesson_date}
                onChange={(e) => handleChange("lesson_date", e.target.value)}
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Start Time</label>
              <input
                type="time"
                className={styles.editInput}
                value={form.start_time}
                onChange={(e) => handleChange("start_time", e.target.value)}
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>End Time</label>
              <input
                type="time"
                className={styles.editInput}
                value={form.end_time}
                onChange={(e) => handleChange("end_time", e.target.value)}
              />
            </div>
          </div>
          <div className={styles.editActions}>
            <button
              className={styles.btnSave}
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              className={styles.btnCancel}
              type="button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Expandable attendance panel ────────────────────────────── */}
      {isExpanded && (
        <div className={styles.panel}>
          <AttendanceTable students={lesson.students ?? []} />
        </div>
      )}
    </div>
  );
}

export default LessonAccordionItem;
