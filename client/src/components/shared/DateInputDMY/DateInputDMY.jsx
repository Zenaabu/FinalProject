// ─── DateInputDMY.jsx ─────────────────────────────────────────────────────────
// Date field that always reads DD/MM/YYYY. A plain <input type="date"> shows
// whatever order the browser locale picks (mm/dd/yyyy on en-US), so here the
// native input is kept for its calendar popup and its value, but its own text
// is hidden and a DD/MM/YYYY label is drawn over it instead.
//
// Props: same as <input type="date"> — value stays "YYYY-MM-DD", and onChange
// receives the native event, so it drops in for an existing date input.

import { formatDate } from "../../../utils/formatDate";
import styles from "./DateInputDMY.module.css";

// Keys that keep working; everything else would type into the hidden
// mm/dd segments, so typing is replaced by opening the calendar.
const PASS_KEYS = ["Tab", "Escape"];

export default function DateInputDMY({ className, value, ...rest }) {
  const openPicker = (e) => {
    try {
      e.currentTarget.showPicker();
    } catch {
      // showPicker unsupported or blocked — the calendar icon still works.
    }
  };

  const handleKeyDown = (e) => {
    if (PASS_KEYS.includes(e.key)) return;
    e.preventDefault();
    if (e.key === "Enter" || e.key === " ") openPicker(e);
  };

  return (
    <div className={styles.wrap}>
      <input
        {...rest}
        type="date"
        value={value}
        className={`${className ?? ""} ${styles.native}`}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
      />
      <span className={styles.display} aria-hidden="true">
        {value ? formatDate(value) : "dd/mm/yyyy"}
      </span>
    </div>
  );
}
