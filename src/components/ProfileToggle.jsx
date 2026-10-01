import { Accessibility, Brain, Check, Ear, Eye } from "lucide-react";
import { PROFILES } from "../lib/constants.js";
import { useDisability } from "../context/useDisability.js";

const ICONS = { wheelchair: Accessibility, cognitive: Brain, hearing_impaired: Ear, visually_impaired: Eye };

/**
 * Four selectable profile cards (a radio group, so arrow keys work).
 * - Default (Settings): a choice is applied and saved immediately; onChange(profile, saved) reports the result.
 * - Controlled (first-time setup): pass `value` and `onSelect(id)`; nothing is saved until the caller does.
 */
export default function ProfileToggle({ onChange = () => {}, value, onSelect }) {
  const { selectedProfile, chooseProfile } = useDisability();
  const controlled = typeof onSelect === "function";
  const current = controlled ? value : selectedProfile;

  async function choose(profile) {
    if (controlled) { onSelect(profile.id); return; }
    const saved = await chooseProfile(profile.id);
    onChange(profile, saved);
  }

  return <fieldset>
    <legend className="text-sm font-semibold text-slate-900">Accessibility profile</legend>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {PROFILES.map(profile => {
        const active = current === profile.id;
        const Icon = ICONS[profile.id];
        return <label key={profile.id} className={"relative flex min-h-28 cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-700 " + (active ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-400")}>
          <input className="sr-only" type="radio" name="accessibility-profile" value={profile.id} checked={active} onChange={() => choose(profile)} />
          <span aria-hidden="true" className={"grid size-12 shrink-0 place-items-center rounded-xl " + (active ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700")}><Icon size={26} /></span>
          <span className="min-w-0 pr-8"><span className="block text-base font-bold text-slate-950">{profile.name}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{profile.description}</span></span>
          {active && <span aria-hidden="true" className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-blue-700 text-white"><Check size={15} /></span>}
        </label>;
      })}
    </div>
  </fieldset>;
}
