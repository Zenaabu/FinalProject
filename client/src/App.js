import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/layout/header/Header";
import Auth from "./components/auth/Auth";

function App() {
  return (
    <Routes>
      {/* Guest landing page — shows the Navbar (more sections coming soon) */}
      <Route path="/" element={<Navbar />} />

      {/* Auth routes */}
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
    </Routes>
  );
}

export default App;
