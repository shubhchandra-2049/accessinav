import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Volume2, Vibrate } from "lucide-react";
import Header from "../components/Header.jsx";
import ProfileToggle from "../components/ProfileToggle.jsx";
import { useDisability } from "../context/useDisability.js";
import { hapticsSupported, vibrate } from "../lib/haptics.js";
import { speak, speechSupported } from "../lib/speech.js";

const WHAT_CHANGES = {
  wheelchair: ["Routes show whether they are step-free (0 steps).", "Results list community reports about lifts, ramps and accessible toilets near your start.", "Search starts with the Wheelchair preference."],
  cognitive: ["Results show at most 2 route options.", "Each route gets plain step-by-step directions.", "Text is larger and spaced out across the app."],
  hearing_impaired: ["Choosing a route opens a full-screen visual route card.", "Vibration patterns confirm actions on supported phones.", "Everything is shown as text, so no audio is needed."],
  visually_impaired: ["Route results and your chosen route are read aloud.", "Vibration confirms button presses and errors on supported phones, and each page name is spoken.", "The whole app switches to a high-contrast black, white and yellow display with larger text, 60px-tall buttons and a single column."],
};

export default function Settings() {
  const { selectedProfile, profile, features } = useDisability();
  const [saved, setSaved] = useState("");
  return <><Header/><main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
    <Link to="/home" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline"><ArrowLeft size={16} aria-hidden="true"/>Home</Link>
    <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-800">Settings</p>
    <h1 className="mt-2 text-3xl font-bold text-slate-950">Accessibility profile</h1>
    <p className="mt-3 text-slate-600">Choose the profile that fits you. It is saved on this device and changes how AccessiNav looks and responds. You can change it at any time.</p>
    <div className="mt-7"><ProfileToggle onChange={(chosen, savedToAccount) => setSaved(savedToAccount ? "Saved: " + chosen.name + " profile." : "Saved on this device, but it could not be saved to your account. Try again later.")}/></div>
    <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm font-medium text-emerald-800">{saved && <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} aria-hidden="true"/>{saved}</span>}</p>

    <section aria-labelledby="what-changes" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 id="what-changes" className="text-lg font-bold text-slate-950">What changes with the {profile.name} profile</h2>
      <ul className="mt-3 grid gap-2 text-slate-700">{WHAT_CHANGES[selectedProfile].map(line => <li key={line} className="flex gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true"/>{line}</li>)}</ul>
      {(features.haptics || features.speech) && <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
        {features.haptics && <button type="button" onClick={() => vibrate("success")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700"><Vibrate size={17} aria-hidden="true"/>Test vibration</button>}
        {features.speech && <button type="button" onClick={() => speak("This is how AccessiNav will read route guidance aloud.")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700"><Volume2 size={17} aria-hidden="true"/>Test spoken guidance</button>}
        {features.haptics && !hapticsSupported && <p className="self-center text-sm text-slate-600">This browser does not support vibration (iPhone Safari does not).</p>}
        {features.speech && !speechSupported && <p className="self-center text-sm text-slate-600">This browser does not support spoken guidance.</p>}
      </div>}
    </section>
  </main></>;
}
