import { Accessibility, MapPin } from "lucide-react";

function geometryPath(geometry) {
  const coordinates = geometry?.type === "LineString" ? geometry.coordinates : [];
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const longitudes = coordinates.map(point => point[0]);
  const latitudes = coordinates.map(point => point[1]);
  const minLon = Math.min(...longitudes), maxLon = Math.max(...longitudes);
  const minLat = Math.min(...latitudes), maxLat = Math.max(...latitudes);
  const width = maxLon - minLon || 1;
  const height = maxLat - minLat || 1;
  const points = coordinates.map(([lon, lat]) => [40 + ((lon - minLon) / width) * 720, 375 - ((lat - minLat) / height) * 330]);
  return { path: points.map(([x, y], index) => (index ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" "), start: points[0], end: points[points.length - 1] };
}

export default function Map({ className = "", search, selectedRoute }) {
  const origin = search?.origin || "Choose an origin";
  const destination = search?.destination || "Choose a destination";
  const route = geometryPath(selectedRoute?.geometry);
  const source = selectedRoute?.realtime_updates?.source === "schedule" ? "Schedule" : selectedRoute?.realtime_updates?.source === "estimate" ? "Estimate" : null;

  return <section aria-label="Route geometry preview" className={"relative isolate min-h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 " + className}>
    <svg aria-hidden="true" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full"><rect width="800" height="420" fill="#f1f5f9"/>{route && <><path d={route.path} fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/><circle cx={route.start[0]} cy={route.start[1]} r="12" fill="#1d4ed8" stroke="white" strokeWidth="5"/><circle cx={route.end[0]} cy={route.end[1]} r="12" fill="#047857" stroke="white" strokeWidth="5"/></>}</svg>
    <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2"><div className="max-w-[45%] rounded-xl border bg-white/95 p-3 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Origin</p><p className="mt-1 truncate text-sm font-semibold text-slate-900">{origin}</p></div><div className="max-w-[45%] rounded-xl border bg-white/95 p-3 text-right shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Destination</p><p className="mt-1 truncate text-sm font-semibold text-slate-900">{destination}</p></div></div>
    <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md"><span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin size={16} className="text-blue-700"/>{selectedRoute ? selectedRoute.mode : "Select a route"}</span>{selectedRoute && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900"><Accessibility size={15}/>{selectedRoute.duration}{source ? " · Source: " + source : ""}</span>}</div>
    {!route && <p className="absolute left-4 right-4 top-1/2 -translate-y-1/2 rounded-xl bg-white/90 p-4 text-center text-sm text-slate-600">{selectedRoute ? "The route service did not provide geometry for this route." : "Route geometry will appear here when provided by the service."}</p>}
  </section>;
}
