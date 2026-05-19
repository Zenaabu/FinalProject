import { Routes } from "react-router-dom";
import "./App.css";
import { landingRoutes } from "./components/landing/landingRoutes";
import { authRoutes } from "./components/auth/authRoutes";
import { aboutRoutes } from "./components/landing/about/aboutRoutes";
import { journeyRoutes } from "./components/landing/journey/journeyRoutes";
import { adminRoutes } from "./components/admin/adminRoutes";

function App() {
  return (
    <Routes>
      {landingRoutes}
      {authRoutes}
      {aboutRoutes}
      {journeyRoutes}
      {adminRoutes}
    </Routes>
  );
}

export default App;
