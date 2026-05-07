import { Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./components/landing/LandingPage";
import Auth from "./components/auth/Auth";

function App() {
  return (
    <Routes>
      {/* Guest landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes */}
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
    </Routes>
  );
}

export default App;
