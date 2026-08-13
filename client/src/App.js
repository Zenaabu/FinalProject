import { Routes } from "react-router-dom";
import "./App.css";
import { landingRoutes } from "./components/landing/landingRoutes";
import { authRoutes } from "./components/auth/authRoutes";
import { aboutRoutes } from "./components/landing/about/aboutRoutes";
import { surfBasicsRoutes } from "./components/landing/surfbasics/surfBasicsRoutes";
import { volumeCalculatorRoutes } from "./components/landing/volumeCalculator/volumeCalculatorRoutes";
import { adminRoutes } from "./components/admin/adminRoutes";
import { instructorRoutes } from "./components/instructor/instructorRoutes";
import { userRoutes } from "./components/user/userRoutes";

function App() {
  return (
    <Routes>
      {landingRoutes}
      {authRoutes}
      {aboutRoutes}
      {surfBasicsRoutes}
      {volumeCalculatorRoutes}
      {adminRoutes}
      {instructorRoutes}
      {userRoutes}
    </Routes>
  );
}

export default App;
