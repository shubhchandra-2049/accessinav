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
import Settings from "./pages/Settings";
import DisabilitySelectorPage from "./pages/DisabilitySelectorPage";
import RequireProfile from "./components/RequireProfile";
import AppEffects from "./components/AppEffects";
import { DisabilityProvider } from "./context/DisabilityContext.jsx";

// Pages for logged-in users: first-time users are sent to the profile selector before reaching them.
const guarded = element => <RequireProfile>{element}</RequireProfile>;

function App() {
  return (
    <DisabilityProvider>
    <AppEffects />
    <Routes>
      <Route path="/" element={<AuthChoice />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/select-disability" element={<DisabilitySelectorPage />} />
      <Route path="/home" element={guarded(<Home />)} />
      <Route path="/search" element={guarded(<Search />)} />
      <Route path="/results" element={guarded(<Results />)} />
      <Route path="/report" element={guarded(<ReportForm />)} />
      <Route path="/volunteer" element={guarded(<VolunteerDashboard />)} />
      <Route path="/ngo" element={guarded(<NgoDashboard />)} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </DisabilityProvider>
  );
}

export default App;
