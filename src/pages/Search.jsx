import { ArrowLeftRight, LoaderCircle, Search as SearchIcon, X } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DisabilitySelector from "../components/DisabilitySelector.jsx";
import LocationAutocomplete from "../components/LocationAutocomplete.jsx";
import { useDisability } from "../context/useDisability.js";
import Header from "../components/Header.jsx";
import Map from "../components/Map.jsx";
import { getRoutes } from "../lib/api.js";
import { resolveRoutePlaces } from "../lib/geocoding.js";
import { SuccessMessage } from "../lib/messages.jsx";

export default function Search() {
 const location = useLocation();
 const initial = location.state?.search || {};
 const [origin, setOrigin] = useState(initial.origin || "");
 const [destination, setDestination] = useState(initial.destination || "");
 const [originPlace, setOriginPlace] = useState(initial.start ? { name: initial.origin, ...initial.start } : null);
 const [destinationPlace, setDestinationPlace] = useState(initial.end ? { name: initial.destination, ...initial.end } : null);
 const { profile } = useDisability();
 const [disability, setDisability] = useState(initial.disability || profile.searchValue); // saved profile is the default; still editable
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const navigate = useNavigate();

 async function submit(event) {
  event.preventDefault(); setError("");
  if (!origin.trim() || !destination.trim()) { setError("Enter both an origin and a destination."); return; }
  if (!disability) { setError("Choose an accessibility requirement."); return; }
  setLoading(true);
  try {
   const places = originPlace && destinationPlace ? { start: originPlace, end: destinationPlace } : await resolveRoutePlaces(origin, destination);
   const search = { origin, destination, disability, ...places };
   const routes = await getRoutes(search);
   navigate("/results", { state: { search, routes } });
  } catch (err) { setError(err.message || "Could not find routes. Please retry."); }
  finally { setLoading(false); }
 }
 function clear() { setOrigin(""); setDestination(""); setOriginPlace(null); setDestinationPlace(null); setDisability(""); setError(""); }
 function swap() { setOrigin(destination); setDestination(origin); setOriginPlace(destinationPlace); setDestinationPlace(originPlace); }
 return <><Header/><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Route planner</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Find an accessible route</h1><p className="mt-2 text-slate-600">Start typing a place or metro station, pick a suggestion, then choose a route preference.</p>{location.state?.notice && <div className="mt-5"><SuccessMessage title={location.state.notice}/></div>}<div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]"><form onSubmit={submit} className="grid content-start gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><LocationAutocomplete label="Origin" value={origin} onChange={setOrigin} onSelect={setOriginPlace} placeholder="Where are you starting?"/><button type="button" onClick={swap} aria-label="Swap origin and destination" className="grid min-h-12 place-items-center rounded-xl border border-slate-300 px-4 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700"><ArrowLeftRight size={20}/><span className="sr-only">Swap</span></button></div><LocationAutocomplete label="Destination" value={destination} onChange={setDestination} onSelect={setDestinationPlace} placeholder="Where are you going?"/><DisabilitySelector selected={disability} onChange={setDisability} name="search-accessibility"/><p className="text-xs leading-5 text-slate-600">When you search, place names are sent to OpenStreetMap Nominatim to find coordinates. <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="font-medium text-blue-800 underline">© OpenStreetMap contributors</a>.</p>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900">{error}</p>}<div className="flex flex-col gap-2 sm:flex-row"><button disabled={loading} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">{loading ? <><LoaderCircle className="animate-spin" size={18}/>Searching…</> : <><SearchIcon size={18}/>Search routes</>}</button><button type="button" onClick={clear} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50"><X size={16}/>Clear</button></div></form><Map search={{ origin, destination, start: originPlace, end: destinationPlace }}/></div></main></>;
}
