import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../lib/api.js";
import { setCurrentUser } from "../lib/auth.js";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const authResponse = await login({ email: normalizedEmail, password });
      setCurrentUser(authResponse);
      navigate("/home", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Login failed. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg" noValidate>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-slate-600">Log in to continue using AccessiNav.</p>
        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus-visible:outline-2 focus-visible:outline-blue-700" placeholder="you@example.com" />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <span className="relative mt-2 block">
            <input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="min-h-12 w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none focus-visible:outline-2 focus-visible:outline-blue-700" placeholder="Enter your password" />
            <button type="button" onClick={() => setShowPassword(visible => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
          </span>
        </label>
        {error && <p role="alert" aria-live="assertive" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900">{error}</p>}
        <button type="submit" disabled={loading} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          {loading ? <><LoaderCircle className="animate-spin" size={18}/>Signing in…</> : <><LogIn size={18}/>Log in</>}
        </button>
        <p className="mt-6 text-center text-sm text-slate-600">Don’t have an account? <Link to="/signup" className="font-medium text-blue-700 hover:underline">Sign up</Link></p>
      </form>
    </main>
  );
}

export default Login;
