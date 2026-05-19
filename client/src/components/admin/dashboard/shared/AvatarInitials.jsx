// ─── AvatarInitials.jsx ───────────────────────────────────────────────────────
// Renders a coloured circle with the person's initials.
// The background colour is derived deterministically from the name string so
// the same name always gets the same colour — no prop needed.
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./AvatarInitials.module.css";

const PALETTE = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f97316", // orange
  "#14b8a6", // teal
  "#ef4444", // red
  "#22c55e", // green
  "#ec4899", // pink
  "#f59e0b", // amber
];

function pickColor(name) {
  let n = 0;
  for (const ch of name) n += ch.charCodeAt(0);
  return PALETTE[n % PALETTE.length];
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function AvatarInitials({ name, size = 36 }) {
  return (
    <div
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        background: pickColor(name),
        fontSize: Math.round(size * 0.38),
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export default AvatarInitials;
