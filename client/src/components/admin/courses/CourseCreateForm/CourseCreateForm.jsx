// ─── CourseCreateForm.jsx ─────────────────────────────────────────────────────
// Standalone form card that lets an admin manager create a new surfing course.
//
// Props:
//   instructors – instructor list loaded once by CoursesMain
//   onCancel  () => void  – called when the user clicks "Cancel"
//   onCreated (newCourse) => void  – called after a successful POST with the
//                                    assembled course returned by the server
//
// POST endpoint : /api/courses
// Field mapping (DB column → form field):
//   description   ← form.description
//   level         ← form.level          (must be lowercase: beginner/intermediate/advanced)
//   capacity      ← form.capacity
//   total_lessons ← form.total_lessons
//   price         ← form.price
//   vat_percent   ← form.vat_percent
//   start_date    ← form.start_date
//   end_date      ← form.end_date
//   user_id       ← form.user_id        (instructor)
//   lessons       ← lessons state array  (required: at least 1)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import styles from "./CourseCreateForm.module.css";

// ─── Empty lesson template ────────────────────────────────────────────────────
const emptyLesson = (number) => ({
  lesson_number: number,
  lesson_date: "",
  start_time: "",
  end_time: "",
});

// ─── Empty form state ─────────────────────────────────────────────────────────
const INITIAL_FORM = {
  description: "", // DB column: description  (was: title)
  level: "beginner", // must be lowercase — server validates ["beginner","intermediate","advanced"]
  capacity: "",
  total_lessons: "",
  price: "",
  vat_percent: 17, // DB column: vat_percent  (was: vat) — default VAT in Israel
  start_date: "",
  end_date: "",
  user_id: "", // DB column: user_id (instructor FK)  (was: instructor_id)
};

// ─────────────────────────────────────────────────────────────────────────────

function CourseCreateForm({ instructors = [], onCancel, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);

  // ── Lessons state (each lesson: lesson_number, lesson_date, start_time, end_time) ──
  // The server requires at least one lesson when creating a course.
  const [lessons, setLessons] = useState([emptyLesson(1)]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── Course field change handler ───────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Lesson field change handler ───────────────────────────────────────────
  const handleLessonChange = (index, field, value) => {
    setLessons((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    );
    // Clear lessons-level error when user edits a lesson
    if (errors.lessons) {
      setErrors((prev) => ({ ...prev, lessons: undefined }));
    }
  };

  // ── Add a new empty lesson row ────────────────────────────────────────────
  const handleAddLesson = () => {
    const maxAllowed = Number(form.total_lessons) || 999;
    if (lessons.length >= maxAllowed) return;
    setLessons((prev) => [...prev, emptyLesson(prev.length + 1)]);
  };

  // ── Remove a lesson row (keep at least 1) ────────────────────────────────
  const handleRemoveLesson = (index) => {
    if (lessons.length === 1) return;
    setLessons((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((l, i) => ({ ...l, lesson_number: i + 1 })),
    );
  };

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const next = {};

    if (!form.description.trim())
      next.description = "Course description is required.";
    if (!form.capacity) next.capacity = "Capacity is required.";
    if (!form.total_lessons) next.total_lessons = "Total lessons is required.";
    if (!form.price) next.price = "Price is required.";
    if (!form.start_date) next.start_date = "Start date is required.";
    if (!form.end_date) next.end_date = "End date is required.";
    if (!form.user_id) next.user_id = "Please assign an instructor.";

    // The server requires a course to start in the future
    const today = new Date().toISOString().slice(0, 10);
    if (form.start_date && form.start_date <= today) {
      next.start_date = "Start date must be in the future.";
    }

    if (form.start_date && form.end_date && form.end_date <= form.start_date) {
      next.end_date = "End date must be after start date.";
    }

    // Validate every lesson row has all fields filled
    const hasEmptyLesson = lessons.some(
      (l) => !l.lesson_date || !l.start_time || !l.end_time,
    );
    if (hasEmptyLesson) {
      next.lessons =
        "All lesson rows must have a date, start time, and end time.";
    } else if (form.start_date && form.end_date) {
      // Every lesson must fall inside the course date range
      const outside = lessons.some(
        (l) => l.lesson_date < form.start_date || l.lesson_date > form.end_date,
      );
      if (outside) {
        next.lessons = `Every lesson must fall between ${form.start_date} and ${form.end_date}.`;
      }
    }

    // Each lesson must start before it ends
    if (!next.lessons && lessons.some((l) => l.start_time >= l.end_time)) {
      next.lessons = "Each lesson must start before it ends.";
    }

    return next;
  };

  // ── Submit handler ────────────────────────────────────────────────────────
  /**
   * handleCreateSubmit
   *
   * The instructor / lesson timeframe conflict check is done by the server:
   * POST /api/courses runs validateDuplicateCourse and
   * validateInstructorLessonConflict before anything is written, and returns
   * 409 with a readable message when the selected instructor is already
   * teaching at one of the lesson times. That message is surfaced in the error
   * banner, so the check is not duplicated here.
   */
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Step 1 – Client-side validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      // ── POST to /api/courses ─────────────────────────────────────────────
      // Field names MUST match what the server validates in adminValidations.js:
      //   description, level (lowercase), price, capacity, total_lessons,
      //   vat_percent, start_date, end_date, user_id, lessons[]
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          level: form.level, // already lowercase from select values
          capacity: Number(form.capacity),
          total_lessons: Number(form.total_lessons),
          price: Number(form.price),
          vat_percent: Number(form.vat_percent),
          start_date: form.start_date,
          end_date: form.end_date,
          // user_id is an Israeli ID number (9-digit string, may have a leading zero).
          // Do NOT convert with Number() — it would strip the leading zero and break
          // the foreign key lookup against users.user_id (VARCHAR).
          user_id: form.user_id,
          lessons, // array of { lesson_number, lesson_date, start_time, end_time }
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create course.");
      }

      // Reset and notify parent
      setForm(INITIAL_FORM);
      setLessons([emptyLesson(1)]);
      onCreated?.(data.course);
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.card}>
      {/* ── Card header ───────────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Create New Course</h2>
        <p className={styles.cardSubtitle}>
          Fill in the details below to add a new surfing course.
        </p>
      </div>

      {/* ── Server-level error banner ──────────────────────────────────────── */}
      {errors.server && (
        <div className={styles.errorBanner} role="alert">
          {errors.server}
        </div>
      )}

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <form className={styles.form} onSubmit={handleCreateSubmit} noValidate>
        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — Course Details (2-column grid)
        ══════════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionTitle}>Course Details</div>

        <div className={styles.grid}>
          {/* ── Course Description (spans both columns) ─────────────────── */}
          <div className={`${styles.field} ${styles.colSpan2}`}>
            <label className={styles.label} htmlFor="ccf-description">
              Course Description / Title
            </label>
            <input
              id="ccf-description"
              className={`${styles.input} ${errors.description ? styles.inputError : ""}`}
              type="text"
              name="description"
              placeholder="e.g. Beginner Ocean Surfing — Summer 2026"
              value={form.description}
              onChange={handleChange}
            />
            {errors.description && (
              <span className={styles.errorMsg}>{errors.description}</span>
            )}
          </div>

          {/* ── Level ───────────────────────────────────────────────────── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ccf-level">
              Level
            </label>
            <select
              id="ccf-level"
              className={styles.select}
              name="level"
              value={form.level}
              onChange={handleChange}
            >
              {/* Values are lowercase to match server validation */}
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* ── Capacity ────────────────────────────────────────────────── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ccf-capacity">
              Capacity (students)
            </label>
            <input
              id="ccf-capacity"
              className={`${styles.input} ${errors.capacity ? styles.inputError : ""}`}
              type="number"
              name="capacity"
              min="1"
              placeholder="e.g. 12"
              value={form.capacity}
              onChange={handleChange}
            />
            {errors.capacity && (
              <span className={styles.errorMsg}>{errors.capacity}</span>
            )}
          </div>

          {/* ── Total Lessons ───────────────────────────────────────────── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ccf-total-lessons">
              Total Lessons
            </label>
            <input
              id="ccf-total-lessons"
              className={`${styles.input} ${errors.total_lessons ? styles.inputError : ""}`}
              type="number"
              name="total_lessons"
              min="1"
              placeholder="e.g. 8"
              value={form.total_lessons}
              onChange={handleChange}
            />
            {errors.total_lessons && (
              <span className={styles.errorMsg}>{errors.total_lessons}</span>
            )}
          </div>

          {/* ── Price ───────────────────────────────────────────────────── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ccf-price">
              Price (₪)
            </label>
            <input
              id="ccf-price"
              className={`${styles.input} ${errors.price ? styles.inputError : ""}`}
              type="number"
              name="price"
              min="0"
              step="0.01"
              placeholder="e.g. 1200"
              value={form.price}
              onChange={handleChange}
            />
            {errors.price && (
              <span className={styles.errorMsg}>{errors.price}</span>
            )}
          </div>

          {/* ── VAT ─────────────────────────────────────────────────────── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ccf-vat">
              VAT (%)
            </label>
            <input
              id="ccf-vat"
              className={styles.input}
              type="number"
              name="vat_percent"
              min="0"
              max="100"
              value={form.vat_percent}
              onChange={handleChange}
            />
          </div>

          {/* ── Start Date ──────────────────────────────────────────────── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ccf-start-date">
              Start Date
            </label>
            <input
              id="ccf-start-date"
              className={`${styles.input} ${errors.start_date ? styles.inputError : ""}`}
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
            />
            {errors.start_date && (
              <span className={styles.errorMsg}>{errors.start_date}</span>
            )}
          </div>

          {/* ── End Date ────────────────────────────────────────────────── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ccf-end-date">
              End Date
            </label>
            <input
              id="ccf-end-date"
              className={`${styles.input} ${errors.end_date ? styles.inputError : ""}`}
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
            />
            {errors.end_date && (
              <span className={styles.errorMsg}>{errors.end_date}</span>
            )}
          </div>

          {/* ── Assigned Instructor (spans both columns) ─────────────────── */}
          <div className={`${styles.field} ${styles.colSpan2}`}>
            <label className={styles.label} htmlFor="ccf-instructor">
              Assigned Instructor
            </label>
            <select
              id="ccf-instructor"
              className={`${styles.select} ${errors.user_id ? styles.inputError : ""}`}
              name="user_id"
              value={form.user_id}
              onChange={handleChange}
            >
              <option value="">
                {instructors.length === 0
                  ? "Loading instructors…"
                  : "— Select an instructor —"}
              </option>
              {instructors.map((inst) => (
                <option key={inst.user_id} value={inst.user_id}>
                  {inst.first_name} {inst.last_name}
                </option>
              ))}
            </select>
            {errors.user_id && (
              <span className={styles.errorMsg}>{errors.user_id}</span>
            )}
          </div>
        </div>
        {/* /grid */}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — Lessons
            The server requires at least one lesson in the lessons[] array.
            Each lesson must have: lesson_date, start_time, end_time.
            lesson_number is assigned automatically (1-based index).
        ══════════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionTitle}>
          Lessons
          <span className={styles.sectionHint}>
            (at least 1 required — must fall within the course dates)
          </span>
        </div>

        {errors.lessons && (
          <div className={styles.errorBanner} role="alert">
            {errors.lessons}
          </div>
        )}

        <div className={styles.lessonsList}>
          {lessons.map((lesson, index) => (
            <div key={index} className={styles.lessonRow}>
              {/* Lesson number badge */}
              <span className={styles.lessonBadge}>
                #{lesson.lesson_number}
              </span>

              {/* Date */}
              <div className={styles.lessonField}>
                <label
                  className={styles.label}
                  htmlFor={`ccf-lesson-date-${index}`}
                >
                  Date
                </label>
                <input
                  id={`ccf-lesson-date-${index}`}
                  className={styles.input}
                  type="date"
                  value={lesson.lesson_date}
                  onChange={(e) =>
                    handleLessonChange(index, "lesson_date", e.target.value)
                  }
                />
              </div>

              {/* Start time */}
              <div className={styles.lessonField}>
                <label
                  className={styles.label}
                  htmlFor={`ccf-lesson-start-${index}`}
                >
                  Start
                </label>
                <input
                  id={`ccf-lesson-start-${index}`}
                  className={styles.input}
                  type="time"
                  value={lesson.start_time}
                  onChange={(e) =>
                    handleLessonChange(index, "start_time", e.target.value)
                  }
                />
              </div>

              {/* End time */}
              <div className={styles.lessonField}>
                <label
                  className={styles.label}
                  htmlFor={`ccf-lesson-end-${index}`}
                >
                  End
                </label>
                <input
                  id={`ccf-lesson-end-${index}`}
                  className={styles.input}
                  type="time"
                  value={lesson.end_time}
                  onChange={(e) =>
                    handleLessonChange(index, "end_time", e.target.value)
                  }
                />
              </div>

              {/* Remove button (hidden when only 1 lesson) */}
              {lessons.length > 1 && (
                <button
                  type="button"
                  className={styles.btnRemoveLesson}
                  onClick={() => handleRemoveLesson(index)}
                  aria-label={`Remove lesson ${lesson.lesson_number}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add lesson button (disabled when lessons === total_lessons) */}
        <button
          type="button"
          className={styles.btnAddLesson}
          onClick={handleAddLesson}
          disabled={
            form.total_lessons !== "" &&
            lessons.length >= Number(form.total_lessons)
          }
        >
          + Add Lesson
        </button>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>

          {/*
           * "btn-primary" is the global utility class defined in index.css.
           * It applies var(--color-light-accent) background and white text.
           * The local btnSubmit class adds sizing / shape on top of it.
           */}
          <button
            type="submit"
            className={`btn-primary ${styles.btnSubmit}`}
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseCreateForm;
