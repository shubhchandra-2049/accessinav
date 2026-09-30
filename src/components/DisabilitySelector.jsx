import { Check } from "lucide-react";
import { ACCESSIBILITY_OPTIONS } from "../lib/constants.js";

export default function DisabilitySelector({ selected, onChange = () => {}, options = ACCESSIBILITY_OPTIONS, name = "accessibility" }) {
  return <fieldset>
    <legend className="text-sm font-semibold text-slate-900">Accessibility requirement</legend>
    <p className="mt-1 text-sm text-slate-600">Choose the access needs your route should prioritize.</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {options.map(item => {
        const active = selected === item.id;
        return <label key={item.id} className={"flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-3 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-700 " + (active ? "border-blue-700 bg-blue-50 ring-1 ring-blue-200" : "border-slate-200 bg-white hover:border-slate-400")}>
          <input className="sr-only" type="radio" name={name} value={item.id} checked={active} onChange={() => onChange(item.id)} />
          <span aria-hidden="true" className={"mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border " + (active ? "border-blue-700 bg-blue-700 text-white" : "border-slate-400 text-transparent")}><Check size={13} /></span>
          <span><span className="block text-sm font-semibold text-slate-900">{item.name}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{item.description}</span></span>
        </label>;
      })}
    </div>
  </fieldset>;
}

