import { Route } from "react-router-dom";
import Main from "../layout/main/Main";
import AboutPage from "./AboutPage";

export const aboutRoutes = (
  <Route element={<Main />}>
    <Route path="/about" element={<AboutPage />} />
  </Route>
);
