// ─── LessonList.jsx ───────────────────────────────────────────────────────────
// Right column of the CourseDetailManager grid.
// Displays the 5 scheduled lessons for the selected course.
// Clicking "Edit" opens an inline modal to modify the lesson date/instructor.
//
// CRITICAL REQUIREMENT: The edit modal includes a checkbox:
//   "Notify participants of changes via email"
// This allows the system to trigger email alerts to enrolled students when
// a lesson's schedule or instructor changes.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import styles from "./LessonList.module.css";

/* ── Mock instructor options ─────────────────────────────────────────────── */
const INSTRUCTORS = ["Maya Katz", "Lior Ben-David", "Noa Cohen", "Avi Peretz"];

/* ── Mock lesson generator (5 lessons per course) ────────────────────────── */
function getMockLessons(courseId) {
  const base = [
    {
      id: 1,
      date: "2026-06-05",
      startTime: "09:00",
      endTime: "12:00",
      instructor: "Maya Katz",
      status: "Scheduled",
    },
    {
      id: 2,
      date: "2026-06-09",
      startTime: "09:00",
      endTime: "12:00",
      instructor: "Maya Katz",
      status: "Scheduled",
    },
    {
      id: 3,
      date: "2026-06-12",
      startTime: "10:00",
      endTime: "13:00",
      instructor: "Lior Ben-David",
      status: "Scheduled",
    },
    {
      id: 4,
      date: "2026-06-16",
      startTime: "09:00",
      endTime: "12:00",
      instructor: "Maya Katz",
      status: "Cancelled",
    },
    {
      id: 5,
      date: "2026-06-19",
      startTime: "09:00",
      endTime: "12:00",
      instructor: "Maya Katz",
      status: "Scheduled",
    },
  ];
  // Offset dates slightly per courseId so mock data looks distinct
  return base.map((l) => ({ ...l, id: courseId * 100 + l.id }));
}

/* ─────────────────────────────────────────────────────────────────────────────
   LessonEditModal
   Inline modal for editing a single lesson.
   Includes the mandatory "Notify participants" checkbox.
───────────────────────────────────────────────────────────────────────────── */
function LessonEditModal({ lesson, onSave, onClose }) {
  const [editData, setEditData] = useState({
    date: lesson.date,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    instructor: lesson.instructor,
    status: lesson.status,
  });

  // CRITICAL: This flag controls whether the backend sends email notifications
  // to all enrolled students when this lesson's details are changed.
  const [notifyParticipants, setNotifyParticipants] = useState(true);

  function handleChange(e) {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: Pass notifyParticipants flag to API call:
    //   PATCH /api/lessons/:id  { ...editData, notifyParticipants }
    onSave({ ...lesson, ...editData }, notifyParticipants);
  }

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Lesson"
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Edit Lesson</h3>
          <button
            className={styles.btnClose}
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          {/* Date */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="le-date">
              Date
            </label>
            <input
              id="le-date"
              className={styles.input}
              type="date"
              name="date"
              value={editData.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Start / End time */}
          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="le-start">
                Start Time
              </label>
              <input
                id="le-start"
                className={styles.input}
                type="time"
                name="startTime"
                value={editData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="le-end">
                End Time
              </label>
              <input
                id="le-end"
                className={styles.input}
                type="time"
                name="endTime"
                value={editData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Instructor */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="le-instructor">
              Instructor
            </label>
            <select
              id="le-instructor"
              className={styles.select}
              name="instructor"
              value={editData.instructor}
              onChange={handleChange}
            >
              {INSTRUCTORS.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="le-status">
              Status
            </label>
            <select
              id="le-status"
              className={styles.select}
              name="status"
              value={editData.status}
              onChange={handleChange}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* ── CRITICAL: Email notification checkbox ─────────────────────
              SYSTEM REQUIREMENT: When a lesson date or instructor changes,
              the admin must have the option to notify all enrolled students
              via email. This checkbox passes the `notifyParticipants` flag
              to the backend email service (e.g. POST /api/notifications/lesson-change).
          ─────────────────────────────────────────────────────────────── */}
          <label className={styles.notifyLabel}>
            <input
              className={styles.notifyCheckbox}
              type="checkbox"
              checked={notifyParticipants}
              onChange={(e) => setNotifyParticipants(e.target.checked)}
            />
            Notify participants of changes via email
          </label>

          {/* Actions */}
          <div className={styles.modalActions}>
            <button
              className={styles.btnCancel}
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className={styles.btnSave} type="submit">
              Save Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LessonList
───────────────────────────────────────────────────────────────────────────── */
function LessonList({ courseId, courseName }) {
  const [lessons, setLessons] = useState(() => getMockLessons(courseId));
  const [editingLesson, setEditingLesson] = useState(null);

  function handleSave(updatedLesson, notifyParticipants) {
    setLessons((prev) =>
      prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l)),
    );
    if (notifyParticipants) {
      // TODO: trigger email notification API call here
      console.info(
        `Email notification queued for lesson ${updatedLesson.id} in course "${courseName}".`,
      );
    }
    setEditingLesson(null);
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Lessons — {courseName}</h3>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Instructor</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className={styles.row}>
                <td>{lesson.date}</td>
                <td>{lesson.startTime}</td>
                <td>{lesson.endTime}</td>
                <td className={styles.instructorCell}>{lesson.instructor}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      lesson.status === "Scheduled"
                        ? styles.statusScheduled
                        : styles.statusCancelled
                    }`}
                  >
                    {lesson.status}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.btnEdit}
                    type="button"
                    onClick={() => setEditingLesson(lesson)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Edit modal (rendered when a lesson is selected) ────────────── */}
      {editingLesson && (
        <LessonEditModal
          lesson={editingLesson}
          onSave={handleSave}
          onClose={() => setEditingLesson(null)}
        />
      )}
    </div>
  );
}

export default LessonList;
