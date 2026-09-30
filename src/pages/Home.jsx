import { ArrowRight, FilePlus2, MapPin, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ReportCard from "../components/ReportCard.jsx";
import SOSButton from "../components/SOSButton.jsx";
import ErrorToast from "../components/ErrorToast.jsx";
import { EmptyState } from "../lib/messages.jsx";
import { getReports, upvoteReport } from "../lib/api.js";
import { getCurrentUser } from "../lib/auth.js";

export default function Home() {
  const user = getCurrentUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const refreshReports = useCallback(async () => {
    const latest = await getReports();
    setReports(latest);
  }, []);

  useEffect(() => {
    let active = true;
    getReports().then(data => { if (active) setReports(data); })
      .catch(requestError => { if (active) setError(requestError.message || "Reports could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function upvote(id) {
    setWorkingId(id);
    setError("");
    try {
      await upvoteReport(id);
      await refreshReports();
    } catch (requestError) {
      setError(requestError.message || "Your upvote could not be saved.");
    } finally {
      setWorkingId(null);
    }
  }

  return <><Header/><main>
    <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16"><div><span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-semibold text-blue-900"><ShieldCheck size={16}/>AccessiNav community</span><h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{user?.name ? `Welcome, ${user.name}.` : "Accessible travel made easier."}</h1><p className="mt-4 max-w-2xl text-lg leading-7 text-slate-600">Search accessible routes and share current access information with the community.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/search" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Find a route<ArrowRight size={18}/></Link><Link to="/report" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50"><FilePlus2 size={18}/>Report an issue</Link><SOSButton/></div></div><div className="hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm lg:block"><MapPin size={26} className="text-blue-700"/><p className="mt-3 text-lg font-bold text-slate-900">Community-powered access</p><p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">Review current reports from AccessiNav contributors before you travel.</p></div></div></section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Live community data</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Accessibility reports</h2></div><Link to="/report" className="text-sm font-semibold text-blue-800 hover:underline">Add a report</Link></div><div className="mt-5">{loading ? <div className="rounded-xl border bg-white p-8"><LoadingSpinner label="Loading reports from AccessiNav…"/></div> : reports.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.slice(0, 6).map(report => <div key={report.id} className="relative"><ReportCard report={report} onUpvote={upvote}/>{workingId === report.id && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/70"><LoadingSpinner label="Saving upvote…"/></div>}</div>)}</div> : <EmptyState title="No reports available">There are no accessibility reports to display right now.</EmptyState>}</div></section>
  </main><ErrorToast message={error} onClose={() => setError("")}/></>;
}
