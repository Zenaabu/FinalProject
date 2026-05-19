// ─── WeeklyAttendance.jsx ─────────────────────────────────────────────────────
// Line chart rendered with plain SVG — no third-party chart library needed.
// Displays Mon–Sun attendance with a filled area under the line.
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./WeeklyAttendance.module.css";

/* ── Chart data (replace with API call later) ────────────────────────────── */
const DATA = [
  { day: "Mon", value: 16 },
  { day: "Tue", value: 25 },
  { day: "Wed", value: 20 },
  { day: "Thu", value: 30 },
  { day: "Fri", value: 42 },
  { day: "Sat", value: 38 },
  { day: "Sun", value: 36 },
];

const Y_TICKS = [0, 15, 30, 45, 60];
const MAX_VAL = 60;

/* ── SVG canvas dimensions ───────────────────────────────────────────────── */
const SVG_W = 320;
const SVG_H = 145;

/* ── Chart area (inside the axes) ────────────────────────────────────────── */
const X0 = 28; // left  (room for y-axis labels)
const X1 = 312; // right
const Y0 = 8; // top
const Y1 = 112; // bottom (above x-axis labels)

const CW = X1 - X0; // chart pixel width
const CH = Y1 - Y0; // chart pixel height

function xAt(i) {
  return X0 + (i / (DATA.length - 1)) * CW;
}
function yAt(value) {
  return Y1 - (value / MAX_VAL) * CH;
}

/* ── Pre-compute point strings ───────────────────────────────────────────── */
const points = DATA.map((d, i) => [xAt(i), yAt(d.value)]);
const lineStr = points
  .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
  .join(" ");
const areaStr = [...points, [X1, Y1], [X0, Y1]]
  .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
  .join(" ");

function WeeklyAttendance() {
  return (
    <div className={styles.card}>
      {/* ── Card header ─────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Weekly Attendance</h2>
        <span className={styles.period}>This week</span>
      </div>

      {/* ── SVG chart ───────────────────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className={styles.svg}
        aria-label="Weekly attendance line chart"
        role="img"
      >
        {/* Y-axis grid lines + labels */}
        {Y_TICKS.map((v) => {
          const y = yAt(v).toFixed(1);
          return (
            <g key={v}>
              <line
                x1={X0}
                y1={y}
                x2={X1}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={X0 - 5}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="9"
                fill="#94a3b8"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Filled area under the line */}
        <polygon points={areaStr} fill="rgba(56, 189, 248, 0.12)" />

        {/* Main line */}
        <polyline
          points={lineStr}
          fill="none"
          stroke="var(--color-ocean-text)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data point dots */}
        {DATA.map((d, i) => (
          <circle
            key={d.day}
            cx={xAt(i).toFixed(1)}
            cy={yAt(d.value).toFixed(1)}
            r="3.5"
            fill="#fff"
            stroke="var(--color-ocean-text)"
            strokeWidth="2"
          />
        ))}

        {/* X-axis day labels */}
        {DATA.map((d, i) => (
          <text
            key={d.day}
            x={xAt(i).toFixed(1)}
            y={Y1 + 16}
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
          >
            {d.day}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default WeeklyAttendance;
