import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header.jsx";
import Map from "../components/Map.jsx";
import RouteCard from "../components/RouteCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorToast from "../components/ErrorToast.jsx";
import { EmptyState, SuccessMessage } from "../lib/messages.jsx";
import { getRoutes } from "../lib/api.js";

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

  useEffect(() => {
    if (!origin || !destination) return undefined;
    let live = true;
    getRoutes(search)
      .then(items => { if (live) { setRoutes(items); setSelected(null); } })
      .catch(err => { if (live) setLoadError(err.message || "Routes could not be loaded."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [origin, destination, disability, search]);

  const missingSearch = !origin || !destination;
  const error = missingSearch ? "Your search details are missing. Please start a new search." : loadError;

  return <><Header/><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <Link to="/search" state={{ search }} className="text-sm font-semibold text-blue-800 hover:underline">← Edit route search</Link>
    <div className="mt-5"><p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Live route results</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Routes to {destination || "your destination"}</h1><p className="mt-2 text-slate-600">From {origin || "your origin"} · preference: {disability || "not selected"}</p></div>
    {selected && !loading && <div className="mt-5"><SuccessMessage title="Route selected">{selected.mode} is shown in the route preview.</SuccessMessage></div>}
    <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]"><section aria-label="Available routes" className="grid gap-4">
      {loading ? <div className="rounded-2xl border bg-white p-8"><LoadingSpinner label="Finding accessible routes…"/></div> : error ? <EmptyState title="Could not load routes">{error}<div className="mt-4"><Link to="/search" state={{ search }} className="font-semibold text-blue-800">Try a new search</Link></div></EmptyState> : routes.length === 0 ? <EmptyState title="No routes found">Try another destination or accessibility preference.</EmptyState> : routes.map(route => <RouteCard key={route.id} route={route} selected={selected?.id === route.id} onSelect={setSelected}/>)}
    </section><div className="lg:sticky lg:top-24"><Map className="min-h-96" search={search} selectedRoute={selected}/></div></div>
  </main><ErrorToast message={loadError} onClose={() => setLoadError("")}/></>;
}



