import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, LoaderCircle, LocateFixed } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import ErrorToast from "../components/ErrorToast.jsx";
import LocationAutocomplete from "../components/LocationAutocomplete.jsx";
import { createReport } from "../lib/api.js";
import { reverseGeocode } from "../lib/mapbox.js";
import { ACCESSIBILITY_OPTIONS } from "../lib/constants.js";
import { SuccessMessage } from "../lib/messages.jsx";
const ISSUE_TYPES = [
 { label: "Mobility Issues", options: ["Missing or broken ramp", "Steps/stairs with no alternative", "Broken elevator or escalator", "Narrow/blocked passage", "Broken or missing accessible toilet", "No accessible seating/space"] },
 { label: "Visual Accessibility", options: ["Missing tactile paving (guide blocks)", "Poor lighting at entry/exit", "No audio announcements", "Confusing or missing signage"] },
 { label: "Hearing Accessibility", options: ["No visual announcements", "No flashing/visual alerts"] },
 { label: "General Transit", options: ["Unclean platform/station", "Overcrowded/congestion", "Broken ticket machine", "Security/safety concern", "✅ Accessible feature (working well!)", "Other barrier"] }
];
const initial = { location: "", issueType: ISSUE_TYPES[0].options[0], description: "", severity: "Medium", category: "" };
const GEO_ERRORS = { 1: "Location permission is blocked. Search for a place instead, or allow location access in your browser settings.", 2: "Your device could not determine its location. Search for a place instead.", 3: "Finding your location took too long. Try again or search for a place." };
export default function ReportForm() {
 const routeState = useLocation().state;
 const [values, setValues] = useState(() => ({ ...initial, location: routeState?.place?.name || "" }));
 const [place, setPlace] = useState(() => { const p = routeState?.place; return p && Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)) ? { name: p.name, latitude: Number(p.latitude), longitude: Number(p.longitude) } : null; });
 const [locating, setLocating] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState(""), [submittedReport, setSubmittedReport] = useState(null);
 const navigate = useNavigate();
 function update(key, value) { setValues(prev => ({ ...prev, [key]: value })); }
 function clearForm() { setValues(initial); setPlace(null); setError(""); setSubmittedReport(null); }

 const captureLocation = useCallback((silent = false) => {
  if (!navigator.geolocation) { if (!silent) setError("This browser cannot provide your current location. Search for a place instead."); return; }
  setLocating(true); if (!silent) setError("");
  navigator.geolocation.getCurrentPosition(async position => {
   const { latitude, longitude } = position.coords;
   const name = (await reverseGeocode(latitude, longitude)) || "Current location";
   setPlace({ name, latitude, longitude }); setValues(prev => ({ ...prev, location: name })); setLocating(false);
  }, geoError => { setLocating(false); if (!silent) setError(GEO_ERRORS[geoError.code] || GEO_ERRORS[2]); }, { enableHighAccuracy: true, timeout: 10000 });
 }, []);

 // No place passed from Results: use the device location only if permission was already granted (no surprise prompt).
 useEffect(() => {
  if (routeState?.place || !navigator.permissions?.query) return;
  navigator.permissions.query({ name: "geolocation" }).then(status => { if (status.state === "granted") captureLocation(true); }).catch(() => {});
 }, [routeState, captureLocation]);

 async function submit(event) {
  event.preventDefault(); setError("");
  if (!place) { setError("Choose a location from the suggestions, or use your current location."); return; }
  if (values.description.trim().length < 10) { setError("Add at least 10 characters describing what you noticed."); return; }
  setLoading(true);
  try { const report = await createReport({ ...values, location: place.name, latitude: place.latitude, longitude: place.longitude }); setSubmittedReport(report); setValues(initial); setPlace(null); }
  catch (err) { setError(err.message || "Your report could not be saved. Please try again."); }
  finally { setLoading(false); }
 }
 return <><Header/><main className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><Link to="/home" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline"><ArrowLeft size={16}/>Home</Link><p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-800">Community reporting</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Share an accessibility update</h1><p className="mt-3 text-slate-600">Your local knowledge helps someone plan what to expect.</p>{submittedReport ? <div className="mt-7 grid gap-4"><SuccessMessage title="Report submitted">Your report about {submittedReport.location} has been sent to AccessiNav.</SuccessMessage><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => navigate("/home")} className="min-h-12 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Back to Home</button><button type="button" onClick={clearForm} className="min-h-12 rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50">Submit Another Report</button></div></div> : <form onSubmit={submit} className="mt-7 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><label className="grid gap-2 text-sm font-semibold text-slate-900">Issue type<select value={values.issueType} onChange={e => update("issueType", e.target.value)} className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue-700">{ISSUE_TYPES.map(group => <optgroup key={group.label} label={group.label}>{group.options.map(option => <option key={option} value={option}>{option}</option>)}</optgroup>)}</select></label><div className="grid gap-2"><LocationAutocomplete label="Location" value={values.location} onChange={text => update("location", text)} onSelect={setPlace} placeholder="Search a place, address, or metro station"/><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => captureLocation(false)} disabled={locating} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-blue-700">{locating ? <LoaderCircle size={16} className="animate-spin"/> : <LocateFixed size={16}/>}{locating ? "Finding your location…" : "Use my current location"}</button><p role="status" aria-live="polite" className={"text-sm " + (place ? "font-medium text-emerald-800" : "text-slate-600")}>{place ? "Location set: " + place.name + " (" + place.latitude.toFixed(4) + ", " + place.longitude.toFixed(4) + ")" : "Pick a suggestion or use your current location."}</p></div></div><label className="grid gap-2 text-sm font-semibold text-slate-900">Description<textarea required rows="5" maxLength={500} value={values.description} onChange={e => update("description", e.target.value)} placeholder="Describe the feature or barrier and where it is." className="rounded-lg border border-slate-300 px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-blue-700"/><span className="text-right text-xs font-normal text-slate-500">{values.description.length}/500 characters (minimum 10)</span></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-slate-900">Severity<select value={values.severity} onChange={e => update("severity", e.target.value)} className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue-700"><option>Low</option><option>Medium</option><option>High</option></select></label><label className="grid gap-2 text-sm font-semibold text-slate-900">Accessibility category<select value={values.category} onChange={e => update("category", e.target.value)} className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue-700"><option value="">Not specified</option>{ACCESSIBILITY_OPTIONS.map(option => <option key={option.id} value={option.name}>{option.name}</option>)}</select></label></div>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900">{error}</p>}<div className="flex flex-col gap-2 sm:flex-row"><button disabled={loading} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{loading ? <><LoaderCircle size={18} className="animate-spin"/>Submitting…</> : <><CheckCircle2 size={18}/>Submit report</>}</button><button type="button" onClick={clearForm} disabled={loading} className="min-h-12 rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50">Clear form</button></div><p className="text-xs leading-5 text-slate-500">Your report is submitted to the AccessiNav service.</p></form>}</main><ErrorToast message={error} onClose={() => setError("")}/></>;
}


