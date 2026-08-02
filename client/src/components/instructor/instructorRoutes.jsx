// ─── instructorRoutes.jsx ─────────────────────────────────────────────────────
// All /instructor/* routes wrapped inside InstructorLayout so every page gets
// the sidebar, and inside RequireRole so only instructors reach them.
// Add new instructor pages here — no other file needs editing.
// ──────────────────────────────────────────────────────────────────────────────

import { Route } from "react-router-dom";
import RequireRole from "../auth/RequireRole";
import UserProfilePage from "../admin/profile/UserProfilePage";
import InstructorLayout from "./InstructorLayout";
import InstructorCourses from "./courses/InstructorCourses";
import CourseAttendance from "./attendance/CourseAttendance";
import InstructorConstraints from "./constraints/InstructorConstraints";

export const instructorRoutes = (
  <Route
    path="/instructor"
    element={
      <RequireRole roles={["instructor"]}>
        <InstructorLayout />
      </RequireRole>
    }
  >
    <Route index element={<InstructorCourses />} />
    <Route path="courses/:course_id" element={<CourseAttendance />} />
    <Route path="constraints" element={<InstructorConstraints />} />
    <Route path="profile" element={<UserProfilePage />} />
  </Route>
);
