import { Route } from "react-router-dom";
import Main from "../layout/main/Main";
import LandingPage from "./LandingPage";

export const landingRoutes = (
  <Route element={<Main />}>
    <Route path="/" element={<LandingPage />} />
  </Route>
);
