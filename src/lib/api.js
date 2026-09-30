import { getAuthToken, clearCurrentUser } from "./auth.js";

const DEFAULT_API_URL = "https://web-production-c199d.up.railway.app/api";
const API_URL = (import.meta.env?.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
function explainError(status, detail) {
  const message = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map(item => item.msg || item.message || JSON.stringify(item)).join("; ") : detail?.message || detail?.error || "";
  if (status === 401) return message || "Your session expired or your login details are incorrect. Please log in again.";
  if (status === 403) return message || "Your account does not have permission to perform this action.";
  if (status === 404) return message || "The requested item or endpoint was not found.";
  if (status === 409) return message || "This request conflicts with existing data. Check whether it already exists.";
  if (status === 422) return message || "Some information is missing or invalid. Review the form and try again.";
  return message || "The server could not complete your request. Please try again.";
}
async function request(path, { method = "GET", body, protectedRead = false, authRequest = false, query } = {}) {
  const upperMethod = method.toUpperCase(), write = upperMethod !== "GET" && !authRequest, token = getAuthToken();
  if ((write || protectedRead) && !token) throw new Error("Please log in again to continue. Your authenticated session is missing.");
  const url = new URL(API_URL + path);
  Object.entries(query || {}).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value)); });
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if ((write || protectedRead) && token) headers.Authorization = "Bearer " + token;
  let response;
  try { response = await fetch(url, { method: upperMethod, headers, body: body === undefined ? undefined : JSON.stringify(body) }); }
  catch { throw new Error("Could not reach AccessiNav services. Check your connection and try again."); }
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text().catch(() => "");
  if (!response.ok) { if (response.status === 401) clearCurrentUser(); throw new Error(explainError(response.status, payload?.detail || payload?.error || payload)); }
  return payload;
}
function unwrapList(payload, ...keys) { if (Array.isArray(payload)) return payload; for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key]; return []; }
function normalizeAuth(payload, fallbackName) {
  const response = payload?.user ? { ...payload.user, token: payload.token || payload.user.token } : payload;
  if (!response?.token || !response?.user_id) throw new Error("The server returned an incomplete authentication response.");
  return { token: response.token, user_id: response.user_id, id: response.user_id, email: response.email, user_type: response.user_type, role: response.user_type, name: response.name || response.organization_name || fallbackName || response.email?.split("@")[0] };
}
function coordinatePair(value, latitude, longitude, label) {
  if (typeof value === "string" && value.includes(",")) { const [lat, lon] = value.split(",").map(Number); if (Number.isFinite(lat) && Number.isFinite(lon)) return lat + "," + lon; }
  const lat = Number(value?.latitude ?? value?.lat ?? latitude), lon = Number(value?.longitude ?? value?.lon ?? longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) throw new Error("Enter valid latitude and longitude for the " + label + ".");
  return lat + "," + lon;
}
function normalizeRoute(route) {
  const realtime = route.realtime_updates || {};
  return { ...route, name: route.name || route.mode || "Accessible route", transportType: route.transportType || route.mode || "Route", accessibilityStatus: route.accessible ? "Accessible" : "Partially accessible", warnings: route.warnings || [], realtime_updates: { ...realtime, source: realtime.source || "estimate" } };
}
function normalizeReport(report) {
  const rawDescription = report.description || "";
  const match = rawDescription.match(/^\[([^·]+) · ([^·]+) · ([^\]]+)\]\n(?:Place: ([^\n]+)\n)?([\s\S]*)$/);
  const verification = report.verification_status || "unverified";
  const date = report.created_at ? new Date(report.created_at).toLocaleString() : report.date || "Recently reported";
  return { ...report, description: match ? match[5] : rawDescription, issueType: report.issue_type || report.issueType || match?.[1]?.trim() || "Accessibility report", severity: report.severity || match?.[2]?.trim() || "Not specified", category: report.category || match?.[3]?.trim() || "Not specified", location: report.location || match?.[4] || (Number.isFinite(Number(report.latitude)) && Number.isFinite(Number(report.longitude)) ? Number(report.latitude).toFixed(5) + ", " + Number(report.longitude).toFixed(5) : "Location not provided"), status: report.status || (verification === "verified" ? "Verified" : verification === "false" || verification === "rejected" ? "Rejected" : "Pending"), date, votes: report.upvotes ?? report.votes ?? 0 };
}
export async function login(credentials) { return normalizeAuth(await request("/auth/login", { method: "POST", body: credentials, authRequest: true })); }
export async function signup(values) {
  const payload = await request("/auth/register", { method: "POST", authRequest: true, body: { name: values.name.trim(), email: values.email.trim().toLowerCase(), password: values.password, user_type: values.role, organization_name: values.role === "ngo" ? values.organizationName?.trim() || values.name.trim() : null } });
  return normalizeAuth(payload, values.name.trim());
}
export async function getRoutes(search) {
  const start = coordinatePair(search.start, search.startLatitude, search.startLongitude, "starting point"), end = coordinatePair(search.end, search.endLatitude, search.endLongitude, "destination");
  return unwrapList(await request("/routes", { query: { start, end, disability: search.disability } }), "routes").map(normalizeRoute);
}
export async function getReports(coords = {}) { const payload = await request("/reports", { query: { lat: coords.lat ?? coords.latitude, lon: coords.lon ?? coords.longitude } }); return unwrapList(payload, "reports").map(normalizeReport); }
export async function createReport(values) {
  const description = ["[" + (values.issueType || "Accessibility report") + " · " + (values.severity || "Unspecified") + " · " + (values.category || "General accessibility") + "]", values.location?.trim() ? "Place: " + values.location.trim() : "", values.description.trim()].filter(Boolean).join("\n");
  const payload = await request("/reports", { method: "POST", body: { description, photo_url: values.photo_url || null, latitude: Number(values.latitude), longitude: Number(values.longitude) } });
  return normalizeReport(payload?.report || payload);
}
export async function upvoteReport(id) { return request("/reports/" + encodeURIComponent(id) + "/upvote", { method: "POST" }); }
export async function verifyReport(id, verificationStatus = "verified") { return request("/reports/" + encodeURIComponent(id) + "/verify", { method: "POST", body: { verification_status: verificationStatus } }); }
export async function bulkVerifyReports(reportIds, verificationStatus = "verified") { return request("/reports/bulk-verify", { method: "POST", body: { report_ids: reportIds, verification_status: verificationStatus } }); }
export async function getPendingReports() { const payload = await request("/dashboard/pending-reports", { protectedRead: true }); return unwrapList(payload, "reports", "pending_reports").map(normalizeReport); }
export async function getVerifiedReports() { const payload = await request("/dashboard/verified", { protectedRead: true }); return unwrapList(payload, "reports", "verified_reports").map(normalizeReport); }
export async function getSosAlerts() { return unwrapList(await request("/sos", { protectedRead: true }), "sos", "alerts", "requests"); }
export async function sendSOS({ latitude, longitude }) { return request("/sos", { method: "POST", body: { latitude: Number(latitude), longitude: Number(longitude) } }); }
export async function resolveSOS(id) { return request("/sos/" + encodeURIComponent(id) + "/resolve", { method: "POST" }); }
export async function getHealth() { return request("/health"); }

