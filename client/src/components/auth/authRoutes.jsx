import { Route } from "react-router-dom";
import Auth from "./Auth";

export const authRoutes = (
  <>
    <Route path="/login" element={<Auth initialMode="login" />} />
    <Route path="/signup" element={<Auth initialMode="signup" />} />
  </>
);
