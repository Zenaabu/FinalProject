// ─── userRoutes.jsx ───────────────────────────────────────────────────────────
// All /user/* routes wrapped inside UserLayout so every page gets the header,
// and inside RequireRole so only the "user" role reaches them.
// Add new user pages here — no other file needs editing.
// ──────────────────────────────────────────────────────────────────────────────

import { Route } from "react-router-dom";
import RequireRole from "../auth/RequireRole";
import UserProfilePage from "../admin/profile/UserProfilePage";
import UserLayout from "./UserLayout/UserLayout";
import UserHome from "./UserHome/UserHome";
import CourseCatalog from "./courses/CourseCatalog";
import EnrollReturn from "./courses/EnrollReturn";
import MyRegistrations from "./courses/MyRegistrations";

export const userRoutes = (
  <Route
    path="/user"
    element={
      <RequireRole roles={["user"]}>
        <UserLayout />
      </RequireRole>
    }
  >
    <Route index element={<UserHome />} />
    <Route path="courses" element={<CourseCatalog />} />
    <Route path="courses/:course_id/paypal/return" element={<EnrollReturn />} />
    <Route path="my-courses" element={<MyRegistrations />} />
    <Route path="profile" element={<UserProfilePage />} />
  </Route>
);
