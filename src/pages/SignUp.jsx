import { useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import { signup } from "../lib/api.js";
import { setCurrentUser } from "../lib/auth.js";

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get("role");
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "", role: ["user", "volunteer", "ngo"].includes(requestedRole) ? requestedRole : "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function update(key, value) { setValues(previous => ({ ...previous, [key]: value })); }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!values.name.trim() || !values.email.trim() || !values.password || !values.confirmPassword) {
      setError("Complete all fields before creating your account.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (values.password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const authResponse = await signup(values);
      setCurrentUser(authResponse);
      // A brand-new account has no profile yet: first-time setup (the route guard also covers older backends).
      navigate(authResponse.disability_profile ? "/home" : "/select-disability", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Account creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <><Header/><main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-10"><form onSubmit={submit} noValidate className="grid w-full max-w-lg gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h1 className="text-3xl font-bold text-slate-950">Create your AccessiNav account</h1><p className="text-slate-600">Join the community and plan more accessible journeys.</p><label className="grid gap-2 text-sm font-semibold">{values.role === "ngo" ? "Organization name" : "Name"}<input required autoComplete={values.role === "ngo" ? "organization" : "name"} value={values.name} onChange={event => update("name", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue-700"/></label><label className="grid gap-2 text-sm font-semibold">Email<input required type="email" autoComplete="email" value={values.email} onChange={event => update("email", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue-700"/></label><label className="grid gap-2 text-sm font-semibold">I am a…<select value={values.role} onChange={event => update("role", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue-700"><option value="user">User</option><option value="volunteer">Volunteer</option><option value="ngo">Organization</option></select></label>{values.role === "ngo" && <p role="note" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">You can use your account right away. An administrator reviews new organizations before they can verify reports or carry the verified badge.</p>}<label className="grid gap-2 text-sm font-semibold">Password<input required minLength={8} type="password" autoComplete="new-password" value={values.password} onChange={event => update("password", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue-700"/></label><label className="grid gap-2 text-sm font-semibold">Confirm password<input required type="password" autoComplete="new-password" value={values.confirmPassword} onChange={event => update("confirmPassword", event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue-700"/></label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900">{error}</p>}<button disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{loading ? <><LoaderCircle className="animate-spin" size={18}/>Creating account…</> : <><UserPlus size={18}/>Create account</>}</button><p className="text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-blue-800 hover:underline">Log in</Link></p></form></main></>;
}
