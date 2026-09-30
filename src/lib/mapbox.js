import { CMRL_STATIONS } from "./cmrlStations.js";

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN || "";
const CHENNAI_CENTER = "80.2707,13.0827";
const CHENNAI_BBOX = "80.0,12.8,80.4,13.3";

export const hasMapboxToken = Boolean(MAPBOX_TOKEN);

function matchStations(query) {
  const q = query.trim().toLowerCase();
  return CMRL_STATIONS
    .filter(s => (s.name + " " + s.alias).toLowerCase().includes(q))
    .slice(0, 4)
    .map(s => ({ id: "cmrl:" + s.name, name: s.name.replace(/^Puratchi Thalaivar Dr\. M\.G\. Ramachandran Central$/, "Chennai Central"), detail: "CMRL Metro station", latitude: s.latitude, longitude: s.longitude, type: "metro" }));
}

/** Name for a coordinate (e.g. the device location); null if unavailable. */
export async function reverseGeocode(latitude, longitude) {
  if (!MAPBOX_TOKEN) return null;
  try {
    const url = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + longitude + "," + latitude + ".json");
    url.search = new URLSearchParams({ access_token: MAPBOX_TOKEN, types: "poi,address,neighborhood,locality", limit: "1" });
    const response = await fetch(url);
    if (!response.ok) return null;
    const feature = (await response.json()).features?.[0];
    return feature ? feature.text + (feature.context?.[0]?.text ? ", " + feature.context[0].text : "") : null;
  } catch {
    return null;
  }
}

/**
 * Suggest places in Chennai: CMRL Metro stations first (Mapbox does not know them),
 * then Mapbox Geocoding results (localities, neighbourhoods, POIs, addresses).
 */
export async function searchPlaces(query, { signal } = {}) {
  const q = query.trim();
  if (q.length < 2) return [];
  const stations = matchStations(q);
  if (!MAPBOX_TOKEN) return stations;

  const url = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(q) + ".json");
  url.search = new URLSearchParams({ access_token: MAPBOX_TOKEN, autocomplete: "true", country: "in", proximity: CHENNAI_CENTER, bbox: CHENNAI_BBOX, types: "poi,locality,neighborhood,place,address", limit: "6" });
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return stations;
    const data = await response.json();
    const places = (data.features || []).map(f => ({ id: f.id, name: f.text, detail: f.place_name, latitude: f.center[1], longitude: f.center[0], type: f.place_type?.[0] || "place" }));
    return [...stations, ...places].slice(0, 8);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return stations;
  }
}
