// ─── courseStatus.js ──────────────────────────────────────────────────────────
// Shared status label for a course object shaped like the entries returned by
// GET /api/courses/my-courses (needs is_active + start_date). Used by both the
// dashboard's course widget and the full My Courses page.
// ──────────────────────────────────────────────────────────────────────────────

export function statusOf(course) {
  const today = new Date().toISOString().slice(0, 10);

  if (!course.is_active) return "Finished";
  if (course.start_date > today) return "Upcoming";
  return "Running";
}
