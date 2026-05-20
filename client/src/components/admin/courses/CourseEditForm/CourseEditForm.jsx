// ─── CourseEditForm.jsx ───────────────────────────────────────────────────────
// Left column of the CourseDetailManager grid.
// Displays a form pre-filled with the selected course's data.
// Validates for duplicate scheduling before saving.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import styles from "./CourseEditForm.module.css";

/* ── Mock instructor options ─────────────────────────────────────────────── */
const INSTRUCTORS = ["Maya Katz", "Lior Ben-David", "Noa Cohen", "Avi Peretz"];
const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Professional",
];

/* ──────────────────────────────────────────────────────────────────────────
   validateDuplicateCourse()
   ──────────────────────────────────────────────────────────────────────────
   SYSTEM REQUIREMENT: Before saving any course changes, this function MUST
   check whether another course already exists with the exact same combination
   of: scheduled hours (start time / end time), timeframe (startDate / endDate),
   and instructor. If a duplicate is found, the save must be blocked and the
   admin must be notified.

   Implementation note: Replace the stub below with a real API call to the
   backend (e.g. GET /api/courses/check-duplicate) passing the relevant fields.
   ────────────────────────────────────────────────────────────────────────── */
function validateDuplicateCourse(formData, currentCourseId) {
  // TODO: Call backend API to check for duplicate scheduling.
  // A duplicate is defined as: same instructor + overlapping date range +
  // overlapping scheduled lesson hours.
  // Return { isDuplicate: false, conflictingCourse: null } when clear to save.
  console.warn(
    "validateDuplicateCourse: stub — wire up backend check before production.",
    { formData, currentCourseId },
  );
  return { isDuplicate: false, conflictingCourse: null };
}

function CourseEditForm({ course, onSave }) {
  const [form, setForm] = useState({
    name: course.name,
    description: course.description,
    difficulty: course.difficulty,
    capacity: course.capacity,
    price: course.price,
    startDate: course.startDate,
    endDate: course.endDate,
    instructor: course.instructor,
  });

  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* ── Field change handler ─────────────────────────────────────────────── */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  }

  /* ── Submit handler ───────────────────────────────────────────────────── */
  function handleSubmit(e) {
    e.preventDefault();

    // Run duplicate-scheduling validation before saving
    const { isDuplicate, conflictingCourse } = validateDuplicateCourse(
      form,
      course.id,
    );

    if (isDuplicate) {
      setSaveError(
        `Scheduling conflict: "${conflictingCourse?.name}" already uses this instructor during the same timeframe.`,
      );
      return;
    }

    // TODO: replace with API call — PATCH /api/courses/:id
    onSave({ ...course, ...form });
    setSaveSuccess(true);
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Edit Course Details</h3>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Course Name */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-name">
            Course Name
          </label>
          <input
            id="cf-name"
            className={styles.input}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-description">
            Description
          </label>
          <textarea
            id="cf-description"
            className={styles.textarea}
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* Difficulty */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-difficulty">
            Difficulty
          </label>
          <select
            id="cf-difficulty"
            className={styles.select}
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
          >
            {DIFFICULTY_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Capacity + Price (two per row) */}
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cf-capacity">
              Capacity
            </label>
            <input
              id="cf-capacity"
              className={styles.input}
              type="number"
              name="capacity"
              min={1}
              value={form.capacity}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cf-price">
              Price (₪)
            </label>
            <input
              id="cf-price"
              className={styles.input}
              type="number"
              name="price"
              min={0}
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Start Date + End Date */}
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cf-startDate">
              Start Date
            </label>
            <input
              id="cf-startDate"
              className={styles.input}
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cf-endDate">
              End Date
            </label>
            <input
              id="cf-endDate"
              className={styles.input}
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Instructor */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-instructor">
            Instructor
          </label>
          <select
            id="cf-instructor"
            className={styles.select}
            name="instructor"
            value={form.instructor}
            onChange={handleChange}
          >
            {INSTRUCTORS.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
        </div>

        {/* Feedback messages */}
        {saveError && <p className={styles.errorMsg}>{saveError}</p>}
        {saveSuccess && (
          <p className={styles.successMsg}>Changes saved successfully.</p>
        )}

        {/* Submit */}
        <button className={styles.btnSave} type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default CourseEditForm;
