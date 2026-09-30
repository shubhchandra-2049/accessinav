import { useEffect, useRef, useState } from "react";
import { Accessibility, MapPin } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN || "";
const CHENNAI_CENTER = [80.2707, 13.0827];

function isLineString(geometry) {
  return geometry?.type === "LineString" && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2;
}

function sourceLabel(route) {
  const source = route?.realtime_updates?.source;
  return source === "schedule" ? "Schedule" : source === "estimate" ? "Estimate" : null;
}

/** Plain-DOM popup content (report/route text is user data, so never use innerHTML). */
function popupContent(title, lines) {
  const box = document.createElement("div");
  box.style.cssText = "max-width:220px;font:14px/1.4 system-ui,sans-serif;color:#0f172a";
  const heading = document.createElement("strong");
  heading.textContent = title;
  box.appendChild(heading);
  lines.filter(Boolean).forEach(text => { const p = document.createElement("p"); p.style.margin = "4px 0 0"; p.textContent = text; box.appendChild(p); });
  return box;
}

function reportMarkerElement(report) {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", "Community report: " + (report.issueType || "Accessibility report"));
  const verified = report.verification_status === "verified";
  const rejected = report.verification_status === "false" || report.verification_status === "rejected";
  el.style.cssText = "width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer;padding:0;background:" + (verified ? "#047857" : rejected ? "#b91c1c" : "#d97706");
  return el;
}

export default function Map(props) {
  const [failed, setFailed] = useState(!MAPBOX_TOKEN);
  return failed ? <RoutePreview {...props} /> : <LiveMap {...props} onFail={() => setFailed(true)} />;
}

function LiveMap({ className = "", search, selectedRoute, routes, reports, onFail }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const glRef = useRef(null);
  const markers = useRef([]);
  const [ready, setReady] = useState(false);

  // Create the map once (mapbox-gl is loaded lazily so it stays out of the main bundle).
  useEffect(() => {
    let cancelled = false;
    Promise.all([import("mapbox-gl"), import("mapbox-gl/dist/mapbox-gl.css")]).then(([module]) => {
      if (cancelled) return;
      const mapboxgl = module.default;
      if (!mapboxgl.supported()) { onFail(); return; }
      mapboxgl.accessToken = MAPBOX_TOKEN;
      glRef.current = mapboxgl;
      const map = new mapboxgl.Map({ container: container.current, style: "mapbox://styles/mapbox/streets-v12", center: CHENNAI_CENTER, zoom: 11 });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      map.on("load", () => {
        map.addSource("routes", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "routes-inactive", type: "line", source: "routes", filter: ["!", ["get", "active"]], layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#64748b", "line-width": 4, "line-opacity": 0.6 } });
        map.addLayer({ id: "routes-active", type: "line", source: "routes", filter: ["get", "active"], layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#1d4ed8", "line-width": 6, "line-opacity": 0.9 } });
        ["routes-inactive", "routes-active"].forEach(layer => {
          map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
          map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
          map.on("click", layer, event => {
            const p = event.features?.[0]?.properties || {};
            new mapboxgl.Popup().setLngLat(event.lngLat).setDOMContent(popupContent(p.mode || "Route", [p.duration && "Duration: " + p.duration, p.distance && "Distance: " + p.distance])).addTo(map);
          });
        });
        setReady(true);
      });
      map.on("error", event => { if (event?.error?.status === 401 || event?.error?.status === 403) onFail(); });
    }).catch(() => { if (!cancelled) onFail(); });
    return () => { cancelled = true; setReady(false); mapRef.current?.remove(); mapRef.current = null; };
  }, [onFail]);

  // Sync routes, pins and report markers whenever data changes.
  useEffect(() => {
    const map = mapRef.current, mapboxgl = glRef.current;
    if (!ready || !map || !mapboxgl) return;

    const list = routes?.length ? routes : selectedRoute ? [selectedRoute] : [];
    const features = list.filter(route => isLineString(route.geometry)).map(route => ({
      type: "Feature", geometry: route.geometry,
      properties: { mode: route.mode, duration: route.duration, distance: route.distance, active: !selectedRoute || route.id === selectedRoute.id },
    }));
    map.getSource("routes").setData({ type: "FeatureCollection", features });

    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    const pin = (point, color, label) => {
      if (!Number.isFinite(Number(point?.latitude)) || !Number.isFinite(Number(point?.longitude))) return null;
      const marker = new mapboxgl.Marker({ color }).setLngLat([Number(point.longitude), Number(point.latitude)]).setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent(label, [search?.[label === "Origin" ? "origin" : "destination"]]))).addTo(map);
      markers.current.push(marker);
      return [Number(point.longitude), Number(point.latitude)];
    };
    const startPoint = pin(search?.start, "#1d4ed8", "Origin");
    const endPoint = pin(search?.end, "#047857", "Destination");

    (reports || []).forEach(report => {
      const lat = Number(report.latitude), lon = Number(report.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      const badge = report.verified_by_type ? "Verified by " + (report.verified_by_name || report.verified_by_type) + " (" + report.verified_by_type + ")" : report.status;
      const popup = new mapboxgl.Popup({ offset: 14 }).setDOMContent(popupContent(report.issueType || "Accessibility report", [report.description, badge, (report.upvotes ?? 0) + " upvotes"]));
      markers.current.push(new mapboxgl.Marker({ element: reportMarkerElement(report) }).setLngLat([lon, lat]).setPopup(popup).addTo(map));
    });

    const bounds = new mapboxgl.LngLatBounds();
    const active = features.filter(feature => feature.properties.active);
    (active.length ? active : features).forEach(feature => feature.geometry.coordinates.forEach(point => bounds.extend(point)));
    [startPoint, endPoint].forEach(point => point && bounds.extend(point));
    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 600 });
  }, [ready, routes, selectedRoute, search, reports]);

  const source = sourceLabel(selectedRoute);
  const hasGeometry = isLineString(selectedRoute?.geometry);
  return <section aria-label="Route map" className={"relative isolate min-h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 " + className}>
    <div ref={container} className="absolute inset-0" />
    <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin size={16} className="text-blue-700" aria-hidden="true"/>{selectedRoute ? selectedRoute.mode : "Select a route"}</span>
      {selectedRoute && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900"><Accessibility size={15} aria-hidden="true"/>{selectedRoute.duration}{source ? " · Source: " + source : ""}{hasGeometry ? "" : " · No path available"}</span>}
    </div>
  </section>;
}

/* Fallback when there is no Mapbox token, no WebGL, or the map fails to load. */
function geometryPath(geometry) {
  if (!isLineString(geometry)) return null;
  const coordinates = geometry.coordinates;
  const longitudes = coordinates.map(point => point[0]);
  const latitudes = coordinates.map(point => point[1]);
  const minLon = Math.min(...longitudes), maxLon = Math.max(...longitudes);
  const minLat = Math.min(...latitudes), maxLat = Math.max(...latitudes);
  const width = maxLon - minLon || 1;
  const height = maxLat - minLat || 1;
  const points = coordinates.map(([lon, lat]) => [40 + ((lon - minLon) / width) * 720, 375 - ((lat - minLat) / height) * 330]);
  return { path: points.map(([x, y], index) => (index ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" "), start: points[0], end: points[points.length - 1] };
}

function RoutePreview({ className = "", search, selectedRoute }) {
  const origin = search?.origin || "Choose an origin";
  const destination = search?.destination || "Choose a destination";
  const route = geometryPath(selectedRoute?.geometry);
  const source = sourceLabel(selectedRoute);

  return <section aria-label="Route geometry preview" className={"relative isolate min-h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 " + className}>
    <svg aria-hidden="true" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full"><rect width="800" height="420" fill="#f1f5f9"/>{route && <><path d={route.path} fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/><circle cx={route.start[0]} cy={route.start[1]} r="12" fill="#1d4ed8" stroke="white" strokeWidth="5"/><circle cx={route.end[0]} cy={route.end[1]} r="12" fill="#047857" stroke="white" strokeWidth="5"/></>}</svg>
    <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2"><div className="max-w-[45%] rounded-xl border bg-white/95 p-3 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Origin</p><p className="mt-1 truncate text-sm font-semibold text-slate-900">{origin}</p></div><div className="max-w-[45%] rounded-xl border bg-white/95 p-3 text-right shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Destination</p><p className="mt-1 truncate text-sm font-semibold text-slate-900">{destination}</p></div></div>
    <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md"><span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin size={16} className="text-blue-700"/>{selectedRoute ? selectedRoute.mode : "Select a route"}</span>{selectedRoute && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900"><Accessibility size={15}/>{selectedRoute.duration}{source ? " · Source: " + source : ""}</span>}</div>
    {!route && <p className="absolute left-4 right-4 top-1/2 -translate-y-1/2 rounded-xl bg-white/90 p-4 text-center text-sm text-slate-600">{selectedRoute ? "The route service did not provide geometry for this route." : "Select a route to see its path here."}</p>}
  </section>;
}
