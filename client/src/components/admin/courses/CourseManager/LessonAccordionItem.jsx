// ─── LessonAccordionItem.jsx ──────────────────────────────────────────────────
// Single expandable lesson row. Clicking anywhere on the header toggles
// the AttendanceTable panel below it. Pencil opens inline edit form.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
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

function attendanceSummary(students) {
  const attended = students.filter(
    (s) => s.attendance_status === "present" || s.attendance_status === "late",
  ).length;
  return `${attended} / ${students.length} attended`;
}

function LessonAccordionItem({ lesson, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState({
    date: lesson.date ?? "",
    startTime: lesson.start_time ?? "",
    endTime: lesson.end_time ?? "",
  });

  const toggle = () => setIsExpanded((prev) => !prev);
  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    // TODO: wire up to API
    console.log("Lesson updated:", { lesson_id: lesson.lesson_id, ...form });
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
            <span className={styles.lessonNumber}>Lesson {index}</span>
          </div>
          <div className={styles.lessonMeta}>
            <span>{lesson.date}</span>
            <span className={styles.dot}>·</span>
            <span>{lesson.time}</span>
            <span className={styles.dot}>·</span>
            <span className={styles.attendanceSummary}>
              {attendanceSummary(lesson.students)}
            </span>
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
          <div className={styles.editGrid}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Date</label>
              <input
                type="date"
                className={styles.editInput}
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Start Time</label>
              <input
                type="time"
                className={styles.editInput}
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>End Time</label>
              <input
                type="time"
                className={styles.editInput}
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
              />
            </div>
          </div>
          <div className={styles.editActions}>
            <button
              className={styles.btnSave}
              type="button"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className={styles.btnCancel}
              type="button"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Expandable attendance panel ────────────────────────────── */}
      {isExpanded && (
        <div className={styles.panel}>
          <AttendanceTable students={lesson.students} />
        </div>
      )}
    </div>
  );
}

export default LessonAccordionItem;
