import { Routes } from "react-router-dom";
import "./App.css";
import { landingRoutes } from "./components/landing/landingRoutes";
import { authRoutes } from "./components/auth/authRoutes";
import { aboutRoutes } from "./components/landing/about/aboutRoutes";
import { surfBasicsRoutes } from "./components/landing/surfbasics/surfBasicsRoutes";
import { adminRoutes } from "./components/admin/adminRoutes";
import { userRoutes } from "./components/user/userRoutes";

function App() {
  return (
    <Routes>
      {landingRoutes}
      {authRoutes}
      {aboutRoutes}
      {surfBasicsRoutes}
      {adminRoutes}
      {userRoutes}
    </Routes>
  );
}

export default App;
