// ─── navConfig.js ─────────────────────────────────────────────────────────────
// Single source of truth for all Admin Sidebar navigation items.
// To add, remove, or reorder a link — only edit this file.
// ──────────────────────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  {
    id: "dashboard",
    labelHe: "ראשי",
    labelEn: "Dashboard Home",
    icon: "dashboard",
    path: "/admin",
  },
  {
    id: "courses",
    labelHe: "ניהול קורסים",
    labelEn: "Courses & Lessons",
    icon: "courses",
    path: "/admin/courses",
  },
  {
    id: "users",
    labelHe: "משתמשים והרשמות",
    labelEn: "Users & Rosters",
    icon: "users",
    path: "/admin/users",
  },
  {
    id: "staff",
    labelHe: "מדריכים ושיבוצים",
    labelEn: "Staff Scheduling",
    icon: "staff",
    path: "/admin/staff",
  },
  {
    id: "reports",
    labelHe: "דוחות",
    labelEn: "Reports & Analytics",
    icon: "reports",
    path: "/admin/reports",
  },
  {
    id: "financials",
    labelHe: "כספים וקבלות",
    labelEn: "Financials",
    icon: "financials",
    path: "/admin/financials",
  },
  {
    id: "settings",
    labelHe: "הגדרות",
    labelEn: "System Settings",
    icon: "settings",
    path: "/admin/settings",
  },
];
