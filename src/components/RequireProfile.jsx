import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { useDisability } from "../context/useDisability.js";
import { getCurrentUser } from "../lib/auth.js";

/** Logged-in users who have not chosen an accessibility profile yet are sent to the selector first. */
export default function RequireProfile({ children }) {
  const { profileChosen, profileReady } = useDisability();
  if (!getCurrentUser()) return children; // logged-out visitors are not asked
  if (!profileReady) return <div className="grid min-h-screen place-items-center"><LoadingSpinner label="Loading your profile…"/></div>;
  return profileChosen ? children : <Navigate to="/select-disability" replace />;
}
