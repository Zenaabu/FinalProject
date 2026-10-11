// ─── DiscountModal.jsx ────────────────────────────────────────────────────────
// Pop-up for applying (or removing) a last-minute discount on one course —
// opened from the "Offer Discount" / "X% OFF Active" badge on
// CourseHeaderCard. Nothing here is automatic: the discount only takes
// effect once the admin picks a percentage and clicks "Apply Discount".
//
// PUT /api/courses/:course_id — discount_percent is just one more field on
// the existing course-update endpoint (adminValidations.validateUpdateCourseDetails
// enforces 1–50, whole numbers, and that the course hasn't started yet), so
// this reuses the same response convention as every other course edit: the
// server sends back the freshly assembled course, which is handed to
// onSaved() so the card updates without re-mapping field names itself.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import styles from "./DiscountModal.module.css";

const PRESETS = [10, 15, 20, 25, 30, 40, 50];
const MIN_PERCENT = 1;
const MAX_PERCENT = 50;

function TagIcon() {
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
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function formatCurrency(value) {
  return `₪${Math.round(Number(value)).toLocaleString("en-US")}`;
}

function DiscountModal({ course, onClose, onSaved }) {
  const hasDiscount = course.discount_percent != null;
  const [percent, setPercent] = useState(
    hasDiscount ? String(course.discount_percent) : "20",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const parsedPercent = Number(percent);
  const isValid =
    percent !== "" &&
    Number.isInteger(parsedPercent) &&
    parsedPercent >= MIN_PERCENT &&
    parsedPercent <= MAX_PERCENT;

  const originalPrice = Number(course.price);
  const newPrice = isValid
    ? Math.round(originalPrice * (1 - parsedPercent / 100))
    : originalPrice;
  const savings = originalPrice - newPrice;

  const submit = async (nextPercent) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/courses/${course.course_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discount_percent: nextPercent }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update the discount.");
      }

      onSaved?.(data.course);
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
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <TagIcon />
        </div>

        <h2 className={styles.title}>
          {hasDiscount ? "Edit Last-Minute Discount" : "Add Last-Minute Discount"}
        </h2>
        <p className={styles.message}>
          This seat is only discounted on the catalog and at checkout once you
          apply it below — nothing changes until you click "Apply Discount."
        </p>

        <div className={styles.courseSummary}>{course.title}</div>

        {/* ── Preset percentages ───────────────────────────────────────── */}
        <div className={styles.presets}>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.presetBtn} ${
                parsedPercent === p ? styles.presetBtnActive : ""
              }`}
              onClick={() => setPercent(String(p))}
              disabled={saving}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* ── Custom percentage ────────────────────────────────────────── */}
        <label className={styles.customLabel} htmlFor="discount-custom">
          Or enter a custom percentage (1–{MAX_PERCENT})
        </label>
        <input
          id="discount-custom"
          type="number"
          className={styles.customInput}
          min={MIN_PERCENT}
          max={MAX_PERCENT}
          step="1"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          disabled={saving}
        />

        {/* ── Price preview ─────────────────────────────────────────────── */}
        <div className={styles.preview}>
          <div className={styles.previewRow}>
            <span className={styles.previewOriginal}>
              {formatCurrency(originalPrice)}
            </span>
            <span className={styles.previewArrow}>→</span>
            <span className={styles.previewNew}>{formatCurrency(newPrice)}</span>
          </div>
          {isValid && savings > 0 && (
            <div className={styles.previewSavings}>
              Students save {formatCurrency(savings)}
            </div>
          )}
        </div>

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
            Cancel
          </button>
          {hasDiscount && (
            <button
              className={styles.btnRemove}
              type="button"
              onClick={() => submit(null)}
              disabled={saving}
            >
              Remove Discount
            </button>
          )}
          <button
            className={styles.btnApply}
            type="button"
            onClick={() => submit(parsedPercent)}
            disabled={saving || !isValid}
          >
            {saving ? "Saving…" : hasDiscount ? "Update Discount" : "Apply Discount"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiscountModal;
