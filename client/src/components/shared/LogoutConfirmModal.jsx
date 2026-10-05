// ─── LogoutConfirmModal.jsx ───────────────────────────────────────────────────
// Confirmation pop-up shown before actually logging out — used by every area
// (user Header, admin/instructor AdminSidebar) instead of logging out on a
// single click, so an accidental click doesn't drop someone out of a form
// or an in-progress task.
//
// Rendered through a portal into document.body rather than in place: the
// user Header has `backdrop-filter` on it for the frosted-glass look, and
// backdrop-filter (like transform) creates a new containing block for any
// `position: fixed` descendant — so without the portal this modal ended up
// pinned inside the header's own box instead of centered on the viewport.
// Mounting on body sidesteps that regardless of which ancestor it's used
// under.
// Props:
//   onConfirm    – fn() called when they click "Log Out"
//   onClose      – fn() called when they cancel / close the overlay
//   loggingOut   – true while the logout request is in flight
// ──────────────────────────────────────────────────────────────────────────────

import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import styles from "./LogoutConfirmModal.module.css";

function LogoutConfirmModal({ onConfirm, onClose, loggingOut }) {
  return createPortal(
    <div
      className={styles.overlay}
      onClick={loggingOut ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <LogOut size={24} />
        </div>

        <h2 className={styles.title}>Log Out?</h2>
        <p className={styles.message}>
          Are you sure you want to log out of your BlueMars Surf Club account?
        </p>

        <div className={styles.footer}>
          <button
            className={styles.btnCancel}
            type="button"
            onClick={onClose}
            disabled={loggingOut}
          >
            Cancel
          </button>
          <button
            className={styles.btnConfirm}
            type="button"
            onClick={onConfirm}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out…" : "Log Out"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default LogoutConfirmModal;
