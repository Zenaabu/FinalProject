// ─── SplitStatCard.jsx ────────────────────────────────────────────────────────
// One KPI card split into two halves side by side, each with its own label ·
// icon · number · sub-text — for two closely related numbers that belong in
// the same slot of the stats row (e.g. "Courses Starting Soon" next to
// "No Students"). A half with an onClick becomes a button. Same props per
// half as StatCard, so StatsRow owns all the data.
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./SplitStatCard.module.css";

function Half({ label, value, sub, subColor, icon, iconBg, iconColor, onClick }) {
  const clickableProps = onClick
    ? {
        onClick,
        role: "button",
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <div
      className={`${styles.half} ${onClick ? styles.clickable : ""}`}
      {...clickableProps}
    >
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span
          className={styles.iconBox}
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </span>
      </div>

      <div className={styles.value}>{value}</div>

      <div className={styles.sub} style={{ color: subColor }}>
        {sub}
      </div>
    </div>
  );
}

function SplitStatCard({ halves }) {
  return (
    <div className={styles.card}>
      {halves.map((h, i) => (
        <Half key={h.id ?? i} {...h} />
      ))}
    </div>
  );
}

export default SplitStatCard;
