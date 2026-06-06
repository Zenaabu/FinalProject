// ─── BlockUserModal.jsx ───────────────────────────────────────────────────────
// Confirmation pop-up before blocking or unblocking a user.
// Props:
//   user       – the user object being actioned
//   onConfirm  – fn(userId) called when admin clicks Confirm
//   onClose    – fn() called when admin cancels / closes overlay
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./BlockUserModal.module.css";

function BlockUserModal({ user, onConfirm, onClose }) {
  const isBlocked = user.status === "Blocked";
  const actionVerb = isBlocked ? "unblock" : "block";
  const actionCap = isBlocked ? "Unblock" : "Block";

  return (
    /* ── Overlay ─────────────────────────────────────────────────── */
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ── Icon ─────────────────────────────────────────────────── */}
        <div
          className={`${styles.iconWrap} ${isBlocked ? styles.iconUnblock : styles.iconBlock}`}
        >
          {isBlocked ? (
            /* unlock icon */
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
          ) : (
            /* lock / block icon */
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>

        {/* ── Text ─────────────────────────────────────────────────── */}
        <h2 className={styles.title}>{actionCap} User</h2>
        <p className={styles.message}>
          Are you sure you want to <strong>{actionVerb}</strong>{" "}
          <strong>{user.name}</strong>?
          {!isBlocked && (
            <span className={styles.warning}>
              {" "}
              This will prevent them from accessing the platform.
            </span>
          )}
        </p>

        {/* ── Buttons ──────────────────────────────────────────────── */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${styles.btnAction} ${isBlocked ? styles.btnActionUnblock : styles.btnActionBlock}`}
            type="button"
            onClick={() => onConfirm(user.id)}
          >
            {actionCap} User
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlockUserModal;
