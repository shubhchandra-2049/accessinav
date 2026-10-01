import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header.jsx";
import Map from "../components/Map.jsx";
import RouteCard from "../components/RouteCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorToast from "../components/ErrorToast.jsx";
import { EmptyState, SuccessMessage } from "../lib/messages.jsx";
import { Maximize2 } from "lucide-react";
import DestinationCard from "../components/DestinationCard.jsx";
import { getReports, getRoutes } from "../lib/api.js";
import { vibrate } from "../lib/haptics.js";
import { speak, stopSpeaking } from "../lib/speech.js";
import { routeSummary } from "../lib/routeText.js";
import { useDisability } from "../context/useDisability.js";

const ACCESS_ISSUE = /elevator|escalator|ramp|toilet|stairs|steps|passage/i;

export default function Results() {
  const location = useLocation();
  const search = location.state?.search;
  const origin = search?.origin || "";
  const destination = search?.destination || "";
  const disability = search?.disability || "";
  const [routes, setRoutes] = useState(location.state?.routes || []);
  const [loading, setLoading] = useState(Boolean(origin && destination));
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [reports, setReports] = useState([]);
  const [cardOpen, setCardOpen] = useState(false);
  const { features } = useDisability();

  // Profile behaviour when a route is chosen: vibration, the full-screen visual card, or spoken guidance.
  function chooseRoute(route) {
    setSelected(route);
    if (features.haptics) vibrate("selected");
    if (features.visualCard) { vibrate("cardOpened"); setCardOpen(true); }
    if (features.speech) speak("Selected. " + routeSummary(route));
  }

  // Spoken profile: read the results aloud when they load.
  useEffect(() => {
    if (!features.speech || loading || routes.length === 0) return undefined;
    speak("Found " + routes.length + (routes.length === 1 ? " route" : " routes") + " to " + destination + ". " + routeSummary(routes[0]));
    return stopSpeaking;
  }, [features.speech, loading, routes, destination]);

  useEffect(() => {
    if (!origin || !destination) return undefined;
    let live = true;
    getRoutes(search)
      .then(items => { if (live) { setRoutes(items); setSelected(null); } })
      .catch(err => { if (live) setLoadError(err.message || "Routes could not be loaded."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [origin, destination, disability, search]);

  // Community reports near the start point, shown as map markers (best effort: failures are ignored)
  const startLat = search?.start?.latitude, startLon = search?.start?.longitude;
  useEffect(() => {
    if (!Number.isFinite(Number(startLat)) || !Number.isFinite(Number(startLon))) return undefined;
    let live = true;
    getReports({ lat: startLat, lon: startLon }).then(items => { if (live) setReports(items); }).catch(() => {});
    return () => { live = false; };
  }, [startLat, startLon]);

  const missingSearch = !origin || !destination;
  const visibleRoutes = features.simplified ? routes.slice(0, 2) : routes; // cognitive profile: fewer options
  const accessAlerts = features.accessInfo ? reports.filter(report => ACCESS_ISSUE.test(report.issueType || "") && report.status !== "Rejected").slice(0, 4) : [];
  const error = missingSearch ? "Your search details are missing. Please start a new search." : loadError;

  return <><Header/><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/search" state={{ search }} className="text-sm font-semibold text-blue-800 hover:underline">← Edit route search</Link>{Number.isFinite(Number(search?.end?.latitude)) && <Link to="/report" state={{ place: { name: destination, latitude: search.end.latitude, longitude: search.end.longitude } }} className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700">Report an issue near {destination}</Link>}</div>
    <div className="mt-5"><p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Live route results</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Routes to {destination || "your destination"}</h1><p className="mt-2 text-slate-600">From {origin || "your origin"} · preference: {disability || "not selected"}</p></div>
    {features.accessInfo && !loading && !missingSearch && <section aria-labelledby="access-alerts" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"><h2 id="access-alerts" className="text-lg font-bold text-slate-950">Lifts, ramps and accessible toilets near your start</h2><p className="mt-1 text-sm text-slate-600">From community reports, not official lift status.</p>{accessAlerts.length ? <ul className="mt-3 grid gap-2">{accessAlerts.map(report => <li key={report.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm"><span><strong>{report.issueType}</strong> · {report.location}</span><span className="font-semibold text-slate-700">{report.status}</span></li>)}</ul> : <p className="mt-3 text-sm text-slate-700">No community reports about lifts, ramps or accessible toilets near your start.</p>}</section>}
    {selected && !loading && <div className="mt-5 grid gap-3"><SuccessMessage title="Route selected">{selected.mode} is shown in the route preview.</SuccessMessage><button type="button" onClick={() => { if (features.haptics) vibrate("cardOpened"); setCardOpen(true); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:justify-self-start"><Maximize2 size={18} aria-hidden="true"/>Open visual destination card</button></div>}
    {cardOpen && selected && <DestinationCard route={selected} destination={destination} onClose={() => setCardOpen(false)}/>}
    <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]"><section aria-label="Available routes" className="grid gap-4">
      {features.simplified && !loading && routes.length > 2 && <p className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-950">Showing the 2 simplest options.</p>}
      {loading ? <div className="rounded-2xl border bg-white p-8"><LoadingSpinner label="Finding accessible routes…"/></div> : error ? <EmptyState title="Could not load routes">{error}<div className="mt-4"><Link to="/search" state={{ search }} className="font-semibold text-blue-800">Try a new search</Link></div></EmptyState> : routes.length === 0 ? <EmptyState title="No routes found">Try another destination or accessibility preference.</EmptyState> : visibleRoutes.map(route => <RouteCard key={route.id} route={route} destination={destination} selected={selected?.id === route.id} onSelect={chooseRoute}/>)}
    </section><div className="lg:sticky lg:top-24"><Map className="min-h-96" search={search} routes={visibleRoutes} reports={reports} selectedRoute={selected}/></div></div>
  </main><ErrorToast message={loadError} onClose={() => setLoadError("")}/></>;
}



