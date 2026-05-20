// ─── adminRoutes.jsx ──────────────────────────────────────────────────────────
// All /admin/* routes wrapped inside AdminLayout so every page automatically
// gets the sidebar. Add new admin pages here — no other file needs editing.
// ──────────────────────────────────────────────────────────────────────────────

import { Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import DashboardHome from "./dashboard/DashboardHome";
import UsersAndRosters from "./users/UsersAndRosters";
import CoursesMain from "./courses/CoursesMain/CoursesMain";

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<DashboardHome />} />
    <Route path="courses" element={<CoursesMain />} />
    <Route path="users" element={<UsersAndRosters />} />
    {/* Future pages — uncomment as you build them:
    <Route path="staff"      element={<StaffPage />} />
    <Route path="reports"    element={<ReportsPage />} />
    <Route path="financials" element={<FinancialsPage />} />
    <Route path="settings"   element={<SettingsPage />} />
    */}
  </Route>
);
