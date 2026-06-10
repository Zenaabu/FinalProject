import { Route } from "react-router-dom";
import UserLayout from "./UserLayout/UserLayout";
import UserHome from "./UserHome/UserHome";

export const userRoutes = (
  <Route path="/user" element={<UserLayout />}>
    <Route index element={<UserHome />} />
    {/* Future pages — add here as you build them:
    <Route path="courses"         element={<CourseCatalog />} />
    <Route path="my-courses"      element={<MyCourses />} />
    <Route path="learning-center" element={<LearningCenter />} />
    <Route path="profile"         element={<UserProfile />} />
    */}
  </Route>
);
