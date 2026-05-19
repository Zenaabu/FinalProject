// ─── StatCard.jsx ─────────────────────────────────────────────────────────────
// Single KPI card: icon box · label · large number · sub-text.
// All content is passed via props so StatsRow owns the data.
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./StatCard.module.css";

function StatCard({ label, value, sub, subColor, icon, iconBg, iconColor }) {
  return (
    <div className={styles.card}>
      {/* ── Top row: label + icon ──────────────────────────────────────── */}
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span
          className={styles.iconBox}
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </span>
      </div>

      {/* ── Big number ────────────────────────────────────────────────── */}
      <div className={styles.value}>{value}</div>

      {/* ── Sub-text (trend / note) ────────────────────────────────────── */}
      <div className={styles.sub} style={{ color: subColor }}>
        {sub}
      </div>
    </div>
  );
}

export default StatCard;
