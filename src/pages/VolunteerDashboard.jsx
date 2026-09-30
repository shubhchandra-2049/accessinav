import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import ReportCard from '../components/ReportCard.jsx'
import { REPORTS } from '../lib/constants.js'
export default function VolunteerDashboard() { return <><Header/><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Community</p><h1 className="mt-2 text-3xl font-bold">Volunteer dashboard</h1><p className="mt-2 text-slate-600">Help keep local access information useful and up to date.</p><Link to="/report" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">Create a report</Link><h2 className="mt-10 text-xl font-bold">Recent community reports</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{REPORTS.map(report => <ReportCard key={report.id} report={report} actionLabel="Review"/> )}</div></main></> }
