// ─── instructorNavConfig.js ───────────────────────────────────────────────────
// Single source of truth for the Instructor sidebar navigation items.
// Same shape as the admin navConfig — `icon` keys must exist in SidebarIcon.
// To add an instructor page: add the entry here and the <Route> in
// instructorRoutes.jsx.
// ──────────────────────────────────────────────────────────────────────────────

export const INSTRUCTOR_NAV_ITEMS = [
  {
    id: "courses",
    labelHe: "הקורסים שלי",
    labelEn: "My Courses",
    icon: "courses",
    path: "/instructor",
  },
  {
    id: "constraints",
    labelHe: "זמינות",
    labelEn: "Availability",
    icon: "calendar",
    path: "/instructor/constraints",
  },
  {
    id: "substitute-lessons",
    labelHe: "שיעורי החלפה",
    labelEn: "Substitute Lessons",
    icon: "users",
    path: "/instructor/substitute-lessons",
  },
  {
    id: "profile",
    labelHe: "פרופיל משתמש",
    labelEn: "My Profile",
    icon: "profile",
    path: "/instructor/profile",
  },
];
