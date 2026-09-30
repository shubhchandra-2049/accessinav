const DEFAULT_GEOCODING_URL = "https://nominatim.openstreetmap.org";
const GEOCODING_URL = (import.meta.env?.VITE_GEOCODING_URL || DEFAULT_GEOCODING_URL).replace(/\/+$/, "");
const MIN_REQUEST_INTERVAL_MS = 1000;
const cache = new Map();
let requestQueue = Promise.resolve();
let lastRequestAt = 0;

function cacheKey(query) { return query.trim().toLocaleLowerCase(); }

async function lookupPlace(place) {
  const key = cacheKey(place);
  if (cache.has(key)) return cache.get(key);

  const request = requestQueue.then(async () => {
    if (cache.has(key)) return cache.get(key);
    const wait = MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
    if (wait > 0) await new Promise(resolve => window.setTimeout(resolve, wait));

    const url = new URL(GEOCODING_URL + "/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", place.trim());

    let response;
    try {
      lastRequestAt = Date.now();
      response = await fetch(url, { headers: { Accept: "application/json" }, referrerPolicy: "strict-origin-when-cross-origin" });
    } catch {
      throw new Error("Place lookup is unavailable right now. Check your connection and try again.");
    }
    if (!response.ok) throw new Error("Place lookup could not complete. Please try again.");
    const matches = await response.json();
    const match = matches?.[0];
    if (!match || !Number.isFinite(Number(match.lat)) || !Number.isFinite(Number(match.lon))) {
      throw new Error("We couldn't find “" + place + "”. Try a fuller address, landmark, or nearby city.");
    }
    const result = { latitude: Number(match.lat), longitude: Number(match.lon) };
    cache.set(key, result);
    return result;
  });
  requestQueue = request.then(() => undefined, () => undefined);
  return request;
}

export async function resolveRoutePlaces(origin, destination) {
  const start = await lookupPlace(origin);
  const end = await lookupPlace(destination);
  return { start, end };
}
