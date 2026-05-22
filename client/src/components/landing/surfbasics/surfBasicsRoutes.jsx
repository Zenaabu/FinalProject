import { Route } from "react-router-dom";
import Main from "../../layout/main/Main";
import SurfBasicsPage from "./SurfBasicsPage";

export const surfBasicsRoutes = (
  <Route element={<Main />}>
    <Route path="/surf-basics" element={<SurfBasicsPage />} />
  </Route>
);
