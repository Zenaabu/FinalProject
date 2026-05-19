// ─── ChangeRoleModal.jsx ──────────────────────────────────────────────────────
// Pop-up for selecting a new role for the chosen user.
// Props:
//   user       – the user object being edited
//   onConfirm  – fn(userId, newRole) called when admin clicks Confirm
//   onClose    – fn() called when admin cancels / closes overlay
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import styles from "./ChangeRoleModal.module.css";

const ROLES = ["User", "Instructor", "Manager"];

function ChangeRoleModal({ user, onConfirm, onClose }) {
  const [selected, setSelected] = useState(user.role);

  function handleConfirm() {
    onConfirm(user.id, selected);
  }

  return (
    /* ── Overlay ─────────────────────────────────────────────────── */
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} /* prevent overlay click closing */
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            {/* badge / role icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div>
            <h2 className={styles.title}>Change Role</h2>
            <p className={styles.sub}>
              Update role for <strong>{user.name}</strong>
            </p>
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

        {/* ── Role selector ─────────────────────────────────────────── */}
        <div className={styles.body}>
          <p className={styles.label}>Select new role:</p>
          <div className={styles.roleList}>
            {ROLES.map((role) => (
              <label
                key={role}
                className={`${styles.roleOption} ${selected === role ? styles.roleOptionActive : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selected === role}
                  onChange={() => setSelected(role)}
                  className={styles.radio}
                />
                <span className={styles.roleOptionLabel}>{role}</span>
                {user.role === role && (
                  <span className={styles.currentBadge}>current</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* ── Footer buttons ────────────────────────────────────────── */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.btnConfirm}
            type="button"
            onClick={handleConfirm}
            disabled={selected === user.role}
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangeRoleModal;
