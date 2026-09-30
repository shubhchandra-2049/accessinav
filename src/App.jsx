import { Routes, Route, Navigate } from "react-router-dom";

import AuthChoice from "./pages/AuthChoice";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Results from "./pages/Results";
import ReportForm from "./pages/ReportForm";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NgoDashboard from "./pages/NgoDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthChoice />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/results" element={<Results />} />
      <Route path="/report" element={<ReportForm />} />
      <Route path="/volunteer" element={<VolunteerDashboard />} />
      <Route path="/ngo" element={<NgoDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
