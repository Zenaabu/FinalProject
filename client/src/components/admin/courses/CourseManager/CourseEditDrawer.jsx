// ─── CourseEditDrawer.jsx ─────────────────────────────────────────────────────
// Modal dialog for editing a course's details.
//
// Props:
//   course   – the course object from CourseManagerDashboard
//              (must include course_id, title, level, status, user_id,
//               start_date, end_date, capacity, price, vat_percent, enrolled)
//   isOpen   – boolean controlling visibility
//   onClose  () => void
//   onSave   (updatedCourse) => void – called with the merged updated object
//
// On "Save Changes":
//   1. Client-side validation runs first.
//   2. PUT /api/admin/courses/:course_id is called.
//   3. The server validates the new dates/instructor against all other active
//      courses (conflict check — no overlapping date ranges for same instructor).
//   4. On success, onSave() is called so CourseManagerDashboard refreshes
//      the card in its state without a full re-fetch.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import styles from "./CourseEditDrawer.module.css";

/* ── Icon ────────────────────────────────────────────────────────────────── */
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

/* ── Build form state from a course object ───────────────────────────────── */
// course.title  = description in DB (mapped in buildCoursesTree)
// course.user_id = instructor FK (Israeli 9-digit ID string)
function formFromCourse(course) {
  return {
    title: course.title ?? "",
    level: course.level ?? "beginner",
    status: course.status ?? "Active", // "Active" | "Inactive"
    user_id: course.user_id ?? "", // Israeli ID string
    start_date: course.start_date ?? "",
    end_date: course.end_date ?? "",
    capacity: course.capacity ?? "",
    price: course.price ?? "",
    vat_percent: course.vat_percent ?? 17,
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
function CourseEditDrawer({ course, isOpen, onClose, onSave }) {
  const [form, setForm] = useState(() => formFromCourse(course));
  const [instructors, setInstructors] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Re-sync form whenever a different course is opened ───────────────────
  useEffect(() => {
    setForm(formFromCourse(course));
    setErrors({});
  }, [course]);

  // ── Fetch real instructors from /api/admin/instructors once ──────────────
  useEffect(() => {
    fetch("/api/admin/instructors")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setInstructors(d.instructors);
      })
      .catch(() => {}); // non-blocking
  }, []);

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.user_id) next.user_id = "Please select an instructor.";
    if (!form.start_date) next.start_date = "Start date is required.";
    if (!form.end_date) next.end_date = "End date is required.";
    if (Number(form.capacity) <= 0)
      next.capacity = "Capacity must be greater than 0.";
    if (Number(form.price) <= 0) next.price = "Price must be greater than 0.";
    if (form.start_date && form.end_date && form.end_date <= form.start_date) {
      next.end_date = "End date must be after start date.";
    }
    return next;
  };

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Step 1 – client validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      // Step 2 – PUT to server
      // Field name mapping:
      //   form.title   → body.description  (DB column name is "description")
      //   form.user_id → body.user_id      (Israeli 9-digit ID — must NOT be cast to Number)
      const res = await fetch(`/api/admin/courses/${course.course_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.title,
          level: form.level,
          status: form.status,
          user_id: form.user_id, // keep as string
          start_date: form.start_date,
          end_date: form.end_date,
          capacity: Number(form.capacity),
          price: Number(form.price),
          vat_percent: Number(form.vat_percent),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update course.");
      }

      // Step 3 – resolve the instructor display name for the header card
      const inst = instructors.find(
        (i) => String(i.user_id) === String(form.user_id),
      );
      const instructorName = inst
        ? `${inst.first_name} ${inst.last_name}`
        : course.instructor;

      // Step 4 – notify parent with the merged updated object
      // (keeps frontend field names like "title" so CourseHeaderCard still works)
      onSave?.({
        ...course,
        title: form.title,
        level: form.level,
        status: form.status,
        user_id: form.user_id,
        instructor: instructorName,
        start_date: form.start_date,
        end_date: form.end_date,
        capacity: Number(form.capacity),
        price: Number(form.price),
        vat_percent: Number(form.vat_percent),
      });

      onClose();
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
          {/* Server error banner */}
          {errors.server && (
            <div className={styles.errorBanner} role="alert">
              {errors.server}
            </div>
          )}

          {/* ── Section: Course Info ─────────────────────────────── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Course Info</h3>

            {/* Title / Description */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-title">
                Course Title
              </label>
              <input
                id="edit-title"
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
              {errors.title && (
                <span className={styles.errorMsg}>{errors.title}</span>
              )}
            </div>

            <div className={styles.row2}>
              {/* Level — values are lowercase (server validates lowercase) */}
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
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Status → server maps "Active"→1, "Inactive"→0 */}
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
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Section: Schedule ───────────────────────────────────── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Schedule</h3>

            {/* Instructor dropdown — loaded from /api/admin/instructors */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-instructor">
                Instructor
              </label>
              <select
                id="edit-instructor"
                className={`${styles.select} ${errors.user_id ? styles.inputError : ""}`}
                value={form.user_id}
                onChange={(e) => handleChange("user_id", e.target.value)}
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

            <div className={styles.row2}>
              {/* Start Date */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-start">
                  Start Date
                </label>
                <input
                  id="edit-start"
                  className={`${styles.input} ${errors.start_date ? styles.inputError : ""}`}
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                />
                {errors.start_date && (
                  <span className={styles.errorMsg}>{errors.start_date}</span>
                )}
              </div>

              {/* End Date */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-end">
                  End Date
                </label>
                <input
                  id="edit-end"
                  className={`${styles.input} ${errors.end_date ? styles.inputError : ""}`}
                  type="date"
                  value={form.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
                {errors.end_date && (
                  <span className={styles.errorMsg}>{errors.end_date}</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Section: Pricing & Capacity ─────────────────────────── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Pricing &amp; Capacity</h3>

            <div className={styles.row2}>
              {/* Max Capacity */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-capacity">
                  Max Capacity
                </label>
                <input
                  id="edit-capacity"
                  className={`${styles.input} ${errors.capacity ? styles.inputError : ""}`}
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                />
                {errors.capacity && (
                  <span className={styles.errorMsg}>{errors.capacity}</span>
                )}
              </div>

              {/* Currently Enrolled — read-only */}
              <div className={styles.field}>
                <label className={styles.label}>Currently Enrolled</label>
                <input
                  className={styles.input}
                  type="number"
                  value={course.enrolled}
                  disabled
                  aria-readonly="true"
                />
              </div>
            </div>

            <div className={styles.row2}>
              {/* Price */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-price">
                  Price (₪)
                </label>
                <input
                  id="edit-price"
                  className={`${styles.input} ${errors.price ? styles.inputError : ""}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
                {errors.price && (
                  <span className={styles.errorMsg}>{errors.price}</span>
                )}
              </div>

              {/* VAT */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-vat">
                  VAT (%)
                </label>
                <input
                  id="edit-vat"
                  className={styles.input}
                  type="number"
                  min="0"
                  max="100"
                  value={form.vat_percent}
                  onChange={(e) => handleChange("vat_percent", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        {/* /body */}

        {/* ── Footer ────────────────────────────────────────────────── */}
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
            className={styles.btnSave}
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

export default CourseEditDrawer;
