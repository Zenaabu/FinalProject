// ─── CourseEditDrawer.jsx ─────────────────────────────────────────────────────
// Slide-in panel from the right for editing course details.
// Controlled by isOpen / onClose props from CourseHeaderCard.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import styles from "./CourseEditDrawer.module.css";

/* ── Icons ───────────────────────────────────────────────────────────────── */
function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CourseEditDrawer({ course, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ ...course });

  /* Sync form state whenever the course prop changes */
  useEffect(() => {
    setForm({ ...course });
  }, [course]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Save course:", form);
    onSave?.(form);
    onClose();
  };

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────── */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer panel ──────────────────────────────────────────── */}
      <div
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Edit course"
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className={styles.header}>
          <div>
            <p className={styles.headerSub}>Editing Course</p>
            <h2 className={styles.headerTitle}>{form.title || course.title}</h2>
          </div>
          <button
            className={styles.btnClose}
            type="button"
            aria-label="Close drawer"
            onClick={onClose}
          >
            <XIcon />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div className={styles.body}>
          {/* ── Section: Course Info ─────────────────────────────── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Course Info</h3>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-title">
                Course Title
              </label>
              <input
                id="edit-title"
                className={styles.input}
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-level">
                  Level
                </label>
                <select
                  id="edit-level"
                  className={styles.select}
                  value={form.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-status">
                  Status
                </label>
                <select
                  id="edit-status"
                  className={styles.select}
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Section: Schedule ───────────────────────────────────── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Schedule</h3>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-instructor">
                Instructor
              </label>
              <input
                id="edit-instructor"
                className={styles.input}
                type="text"
                value={form.instructor}
                onChange={(e) => handleChange("instructor", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-schedule">
                Schedule
              </label>
              <input
                id="edit-schedule"
                className={styles.input}
                type="text"
                placeholder="e.g. Mon, Wed, Fri · 09:00 AM"
                value={form.schedule}
                onChange={(e) => handleChange("schedule", e.target.value)}
              />
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-start">
                  Start Date
                </label>
                <input
                  id="edit-start"
                  className={styles.input}
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-end">
                  End Date
                </label>
                <input
                  id="edit-end"
                  className={styles.input}
                  type="date"
                  value={form.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Section: Capacity ───────────────────────────────────── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Capacity</h3>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-capacity">
                  Max Capacity
                </label>
                <input
                  id="edit-capacity"
                  className={styles.input}
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) =>
                    handleChange("capacity", parseInt(e.target.value, 10))
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Currently Enrolled</label>
                <input
                  className={styles.input}
                  type="number"
                  value={form.enrolled}
                  disabled
                  aria-readonly="true"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={styles.btnSave} type="button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

export default CourseEditDrawer;
