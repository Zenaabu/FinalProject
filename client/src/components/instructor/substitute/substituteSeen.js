// ─── substituteSeen.js ────────────────────────────────────────────────────────
// Remembers which substitute lessons the instructor has already looked at, so
// the red badge on the sidebar clears once they open "Substitute Lessons".
// Stored per browser (localStorage) and keyed by user_id; the layout listens
// for SEEN_EVENT to update the badge without a reload.
// ──────────────────────────────────────────────────────────────────────────────

export const SEEN_EVENT = "substitute-lessons-seen";

function storageKey() {
  try {
    return `substitute_seen_${localStorage.getItem("user_id") || "anon"}`;
  } catch {
    return "substitute_seen_anon";
  }
}

export function getSeenIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(storageKey()) || "[]"));
  } catch {
    return new Set();
  }
}

export function markSeen(ids) {
  try {
    const seen = getSeenIds();
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(storageKey(), JSON.stringify([...seen]));
  } catch {
    // storage unavailable: the badge just comes back next load
  }
  window.dispatchEvent(new Event(SEEN_EVENT));
}
