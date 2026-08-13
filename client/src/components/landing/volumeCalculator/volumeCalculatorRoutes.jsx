import { Route } from "react-router-dom";
import Main from "../../layout/main/Main";
import VolumeCalculatorPage from "./VolumeCalculatorPage";

export const volumeCalculatorRoutes = (
  <Route element={<Main />}>
    <Route path="/volume-calculator" element={<VolumeCalculatorPage />} />
  </Route>
);
