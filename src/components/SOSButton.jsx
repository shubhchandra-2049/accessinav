import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, Radio, Siren, X } from "lucide-react";
import { cancelSOS, sendSOS, updateSOSLocation } from "../lib/api.js";
import { getAuthToken } from "../lib/auth.js";
import { vibrate } from "../lib/haptics.js";
import { speak } from "../lib/speech.js";
import { useDisability } from "../context/useDisability.js";

const UPDATE_INTERVAL_MS = 5000;
const MAX_SHARING_MS = 30 * 60 * 1000;

export default function SOSButton() {
  const { features } = useDisability();
  const dialogRef = useRef(null);
  const watchId = useRef(null);
  const stopTimer = useRef(null);
  const lastSent = useRef(0);
  const alertId = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const stopWatching = useCallback(() => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    clearTimeout(stopTimer.current);
    setSharing(false);
  }, []);
  useEffect(() => stopWatching, [stopWatching]); // stop sharing if the page is left

  function openDialog() {
    if (!sharing) { setMessage(""); setError(""); }
    dialogRef.current?.showModal();
  }

  // Send the person's position to the alert every few seconds until stopped, resolved or timed out.
  function startSharing(id) {
    alertId.current = id;
    lastSent.current = Date.now();
    setSharing(true);
    watchId.current = navigator.geolocation.watchPosition(position => {
      const now = Date.now();
      if (now - lastSent.current < UPDATE_INTERVAL_MS) return;
      lastSent.current = now;
      updateSOSLocation(id, position.coords).then(result => { if (result?.status !== "active") stopWatching(); }).catch(() => {});
    }, () => {}, { enableHighAccuracy: true, maximumAge: 5000 });
    stopTimer.current = setTimeout(stopWatching, MAX_SHARING_MS);
  }

  async function submitSOS() {
    setError("");
    if (!getAuthToken()) { setError("Log in before sending an SOS request."); vibrate("error"); return; }
    if (!navigator.geolocation) { setError("This browser cannot provide your current location."); vibrate("error"); return; }
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error("Could not read your location. Allow location access and try again.")), { enableHighAccuracy: true, timeout: 10000 }));
      const result = await sendSOS({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      vibrate("sosSent");
      if (features.speech) speak("SOS sent. Your location is being shared.");
      setMessage("Your SOS was sent to AccessiNav. Your location is shared live until you stop it or someone resolves your alert.");
      if (result?.alert_id) startSharing(result.alert_id);
    } catch (requestError) {
      vibrate("error");
      setError(requestError.message || "The SOS request could not be sent.");
    } finally {
      setLoading(false);
    }
  }

  async function stopAndCancel() {
    const id = alertId.current;
    stopWatching();
    alertId.current = null;
    if (id) await cancelSOS(id).catch(() => {});
    vibrate("success");
    setMessage("Sharing stopped and your SOS was cancelled.");
  }

  return <><button type="button" onClick={openDialog} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-bold text-white shadow-sm hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"><Siren size={20} aria-hidden="true"/>SOS</button>
    {sharing && <span role="status" className="inline-flex min-h-12 items-center gap-3 rounded-xl border-2 border-red-700 bg-red-50 px-4 text-sm font-bold text-red-900"><Radio size={18} className="animate-pulse" aria-hidden="true"/>Sharing live location<button type="button" onClick={stopAndCancel} className="rounded-md px-2 py-1 underline hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-800">Stop</button></span>}
    <dialog ref={dialogRef} onCancel={() => { if (!sharing) { setMessage(""); setError(""); } }} aria-labelledby="sos-title" className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50"><div className="p-6"><div className="flex items-start justify-between gap-4"><div><span className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-800"><Siren size={22}/></span><h2 id="sos-title" className="mt-4 text-xl font-bold">{sharing ? "SOS is active" : "Send an SOS request?"}</h2></div><button type="button" aria-label="Close SOS dialog" onClick={() => dialogRef.current?.close()} className="grid size-10 place-items-center rounded-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700"><X size={19}/></button></div>
      {!message && <p className="mt-3 text-sm leading-6 text-slate-600">AccessiNav volunteers and approved organizations will see your location and receive live updates while you travel, until you stop sharing, someone resolves your alert, or 30 minutes pass. This does not contact emergency services and makes no sound.</p>}
      {message && <p role="status" aria-live="polite" className="mt-4 flex gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-900"><CheckCircle2 size={18} className="shrink-0"/>{message}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900">{error}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={loading} onClick={() => dialogRef.current?.close()} className="min-h-11 rounded-lg border px-4 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700">{message ? "Close" : "Cancel"}</button>
        {sharing && <button type="button" onClick={stopAndCancel} className="min-h-11 rounded-lg border-2 border-red-700 px-4 text-sm font-semibold text-red-800 hover:bg-red-50">Stop sharing and cancel SOS</button>}
        {!message && !sharing && <button type="button" disabled={loading} onClick={submitSOS} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">{loading && <LoaderCircle className="animate-spin" size={16}/>}Send SOS</button>}</div></div></dialog></>;
}
