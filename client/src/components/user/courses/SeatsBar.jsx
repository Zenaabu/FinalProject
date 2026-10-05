// ─── SeatsBar.jsx ─────────────────────────────────────────────────────────────
// Visual "how full is this course" bar for a CourseCatalog card — one segment
// per seat (like train-carriage windows), filled left-to-right as students
// register. Replaces the old plain "8 / 12" text with something a student
// can read at a glance. Taken segments are blue up to half capacity, then
// switch to red once more than half the seats are gone — a "hurry up, this
// is filling up" cue — and stay red (fully filled) once the course is full.
//
// A very large capacity is grouped into at most MAX_SEGMENTS segments
// (proportional fill) instead of one-per-seat, so the bar can't ever render
// hundreds of DOM nodes.
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./SeatsBar.module.css";

const MAX_SEGMENTS = 40;

function SeatsBar({ capacity, seatsLeft }) {
  const total = Number(capacity) || 0;
  const left = Number(seatsLeft) || 0;
  const taken = Math.max(0, total - left);
  const full = left <= 0;
  // more than half the seats are gone — warn before it's actually full
  const filling = total > 0 && taken / total > 0.5;

  const segmentCount = Math.min(total, MAX_SEGMENTS) || 1;
  const takenSegments =
    total > MAX_SEGMENTS
      ? Math.round((taken / total) * MAX_SEGMENTS)
      : taken;

  return (
    <div className={styles.wrap}>
      <div
        className={styles.track}
        role="img"
        aria-label={`${taken} of ${total} seats taken, ${left} left`}
      >
        {Array.from({ length: segmentCount }).map((_, i) => (
          <span
            key={i}
            className={`${styles.seat} ${
              i < takenSegments ? (filling ? styles.seatDanger : styles.seatTaken) : ""
            }`}
          />
        ))}
      </div>
      <div
        className={`${styles.label} ${full ? styles.labelFull : filling ? styles.labelDanger : ""}`}
      >
        {full
          ? "Course full"
          : filling
            ? `Filling up — only ${left} ${left === 1 ? "seat" : "seats"} left`
            : `${left} ${left === 1 ? "seat" : "seats"} left`}
      </div>
    </div>
  );
}

export default SeatsBar;
