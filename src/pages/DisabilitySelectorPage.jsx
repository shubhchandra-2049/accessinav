import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Accessibility, ArrowRight, LoaderCircle } from "lucide-react";
import ProfileToggle from "../components/ProfileToggle.jsx";
import { useDisability } from "../context/useDisability.js";
import { getCurrentUser } from "../lib/auth.js";

/** First-time setup after sign-up: choose an accessibility profile, then continue to Home. */
export default function DisabilitySelectorPage() {
  const navigate = useNavigate();
  const { chooseProfile, profileChosen, selectedProfile } = useDisability();
  const [choice, setChoice] = useState(profileChosen ? selectedProfile : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!getCurrentUser()) return <Navigate to="/login" replace />;

  async function next() {
    setSaving(true); setError("");
    const saved = await chooseProfile(choice);
    setSaving(false);
    if (!saved) { setError("Your choice is saved on this device, but it could not be saved to your account. You can continue and change it later in Accessibility settings."); }
    navigate("/home", { replace: true });
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
    <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-lg sm:p-10">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-blue-100 text-blue-700"><Accessibility size={28} aria-hidden="true"/></div>
      <h1 className="mt-5 text-center text-3xl font-bold text-slate-950">Choose your accessibility profile</h1>
      <p className="mt-3 text-center text-slate-600">AccessiNav adapts routes, text and alerts to your needs. You can change this at any time in Accessibility settings.</p>
      <div className="mt-8"><ProfileToggle value={choice} onSelect={setChoice}/></div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-950">{error}</p>}
      <button type="button" onClick={next} disabled={!choice || saving} className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
        {saving ? <><LoaderCircle className="animate-spin" size={18} aria-hidden="true"/>Saving…</> : <>Next<ArrowRight size={18} aria-hidden="true"/></>}
      </button>
      {!choice && <p className="mt-2 text-center text-sm text-slate-600">Select a profile to continue.</p>}
    </div>
  </main>;
}
