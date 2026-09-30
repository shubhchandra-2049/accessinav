const SESSION_KEY = "accessinav.auth.session";
const LEGACY_KEYS = ["accessinav.mock.session", "accessinav.mock.users"];

function notifyAuthChanged() {
  window.dispatchEvent(new Event("accessinav:auth-changed"));
}

function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const userType = rawUser.user_type || rawUser.userType || rawUser.role;
  const role = userType === "rider" ? "user" : userType; // "rider" = legacy stored sessions
  return { id: rawUser.user_id || rawUser.id, user_id: rawUser.user_id || rawUser.id, email: rawUser.email, name: rawUser.name || rawUser.organization_name || rawUser.email?.split("@")[0] || "AccessiNav user", role, user_type: userType };
}

export function getAuthSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!stored?.token || !stored?.user?.id) {
      if (stored) clearCurrentUser();
      LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
      return null;
    }
    return stored;
  } catch {
    clearCurrentUser();
    return null;
  }
}
export function getCurrentUser() { const session = getAuthSession(); return session ? normalizeUser(session.user) : null; }
export function getAuthToken() { return getAuthSession()?.token || null; }
export function setCurrentUser(authResponse) {
  const token = authResponse?.token;
  const user = normalizeUser(authResponse?.user || authResponse);
  if (!token || !user?.id) throw new Error("The server returned an incomplete login response.");
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
  LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
  notifyAuthChanged();
  return user;
}
export function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
  LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
  notifyAuthChanged();
}
