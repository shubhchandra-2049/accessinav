import { routeSteps } from "../lib/routeText.js";

/** Large numbered directions for the cognitive profile. */
export default function RouteSteps({ route, destination }) {
  return <ol aria-label="Step-by-step directions" className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4">
    {routeSteps(route, destination).map((text, index) => <li key={index} className="flex items-start gap-3 text-base font-medium text-slate-900">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{index + 1}</span>
      <span><span className="sr-only">Step {index + 1}: </span>{text}</span>
    </li>)}
  </ol>;
}
