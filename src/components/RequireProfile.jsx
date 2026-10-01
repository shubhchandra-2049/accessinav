import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { useDisability } from "../context/useDisability.js";
import { getCurrentUser } from "../lib/auth.js";

/** Logged-in *users* who have not chosen an accessibility profile yet are sent to the selector first.
 *  Volunteers and organizations are never asked (they can still pick one voluntarily in Settings). */
export default function RequireProfile({ children }) {
  const { profileChosen, profileReady } = useDisability();
  const user = getCurrentUser();
  if (!user || user.user_type !== "user") return children; // logged-out visitors, volunteers, organizations
  if (!profileReady) return <div className="grid min-h-screen place-items-center"><LoadingSpinner label="Loading your profile…"/></div>;
  return profileChosen ? children : <Navigate to="/select-disability" replace />;
}
