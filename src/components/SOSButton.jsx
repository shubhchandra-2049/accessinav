import { useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, Siren, X } from "lucide-react";
import { sendSOS } from "../lib/api.js";
import { getAuthToken } from "../lib/auth.js";

export default function SOSButton() {
  const dialogRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function openDialog() {
    setMessage("");
    setError("");
    dialogRef.current?.showModal();
  }

  async function submitSOS() {
    setError("");
    if (!getAuthToken()) { setError("Log in before sending an SOS request."); return; }
    if (!navigator.geolocation) { setError("This browser cannot provide your current location."); return; }
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error("Could not read your location. Allow location access and try again.")), { enableHighAccuracy: true, timeout: 10000 }));
      await sendSOS({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setMessage("Your SOS request was sent to AccessiNav.");
    } catch (requestError) {
      setError(requestError.message || "The SOS request could not be sent.");
    } finally {
      setLoading(false);
    }
  }

  return <><button type="button" onClick={openDialog} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-bold text-white shadow-sm hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"><Siren size={20} aria-hidden="true"/>SOS</button><dialog ref={dialogRef} onCancel={() => { setMessage(""); setError(""); }} aria-labelledby="sos-title" className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50"><div className="p-6"><div className="flex items-start justify-between gap-4"><div><span className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-800"><Siren size={22}/></span><h2 id="sos-title" className="mt-4 text-xl font-bold">Send an SOS request?</h2></div><button type="button" aria-label="Close SOS confirmation" onClick={() => dialogRef.current?.close()} className="grid size-10 place-items-center rounded-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700"><X size={19}/></button></div><p className="mt-3 text-sm leading-6 text-slate-600">AccessiNav will receive your current location. This does not contact emergency services.</p>{message && <p role="status" aria-live="polite" className="mt-4 flex gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-900"><CheckCircle2 size={18} className="shrink-0"/>{message}</p>}{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={loading} onClick={() => dialogRef.current?.close()} className="min-h-11 rounded-lg border px-4 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700">Cancel</button>{!message && <button type="button" disabled={loading} onClick={submitSOS} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">{loading && <LoaderCircle className="animate-spin" size={16}/>}Send SOS</button>}</div></div></dialog></>;
}
