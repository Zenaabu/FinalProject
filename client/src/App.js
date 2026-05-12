import { Routes } from "react-router-dom";
import "./App.css";
import { landingRoutes } from "./components/landing/landingRoutes";
import { authRoutes } from "./components/auth/authRoutes";
import { aboutRoutes } from "./components/landing/about/aboutRoutes";
import { journeyRoutes } from "./components/landing/journey/journeyRoutes";

function App() {
  return (
    <Routes>
      {landingRoutes}
      {authRoutes}
      {aboutRoutes}
      {journeyRoutes}
    </Routes>
  );
}

export default App;
