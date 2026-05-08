import { Route } from "react-router-dom";
import Main from "../layout/main/Main";
import JourneyPage from "./JourneyPage";

export const journeyRoutes = (
  <Route element={<Main />}>
    <Route path="/journey" element={<JourneyPage />} />
  </Route>
);
