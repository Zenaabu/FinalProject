// ─── VatEditModal.jsx ─────────────────────────────────────────────────────────
// Pop-up for changing the single school-wide VAT rate. Opened by clicking the
// "VAT Collected" KPI card on the Financials page.
// Props:
//   onClose   – fn() called when the admin cancels / closes the overlay
//   onSaved   – fn(newRatePercent) called after a successful save
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Percent } from "lucide-react";
import styles from "./VatEditModal.module.css";

function VatEditModal({ onClose, onSaved }) {
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/financials/vat-rate")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRate(String(data.vat_percent));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    const vat = Number(rate);
    if (rate === "" || isNaN(vat) || vat < 0 || vat > 100) {
      setError("VAT percent must be between 0 and 100.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/financials/vat-rate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vat_percent: vat }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update VAT rate");
      }

      onSaved?.(data.vat_percent);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Change VAT rate"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Percent size={18} />
          </div>
          <div>
            <h2 className={styles.title}>Change VAT Rate</h2>
            <p className={styles.sub}>Applies to every course immediately</p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className={styles.body}>
          <label className={styles.label} htmlFor="vat-modal-input">
            VAT Percent
          </label>
          <div className={styles.inputWrap}>
            <input
              id="vat-modal-input"
              type="number"
              min="0"
              max="100"
              step="0.01"
              className={styles.input}
              value={rate}
              disabled={loading}
              onChange={(e) => {
                setRate(e.target.value);
                setError("");
              }}
              autoFocus
            />
            <span className={styles.unit}>%</span>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>

        {/* ── Footer buttons ──────────────────────────────────────────── */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.btnConfirm}
            type="button"
            onClick={handleSubmit}
            disabled={loading || saving}
          >
            {saving ? "Saving…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VatEditModal;
