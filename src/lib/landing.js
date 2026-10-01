// Where to send someone right after they sign up or log in.
// Only regular users have an accessibility profile, so only they see the profile selector;
// volunteers and organizations go straight to their dashboards.
export function landingPath(auth, { signup = false } = {}) {
  if (auth.user_type === "volunteer") return "/volunteer";
  if (auth.user_type === "ngo") return "/ngo";
  // Users: a new account has no profile yet. For login, null means "not chosen yet"; undefined means the backend
  // has no profile storage, so the route guard decides.
  if (signup) return auth.disability_profile ? "/home" : "/select-disability";
  return auth.disability_profile === null ? "/select-disability" : "/home";
}
