// Turns a "YYYY-MM-DD" (or "YYYY-MM-DD HH:MM:SS") DB string into "DD/MM/YYYY".
// Works on the string directly — no Date object — so there's no timezone shift.
export function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}
