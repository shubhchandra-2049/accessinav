import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header.jsx'
import Map from '../components/Map.jsx'
import RouteCard from '../components/RouteCard.jsx'
import { ROUTES } from '../lib/constants.js'
export default function Results() {
 const location = useLocation()
 const [selected, setSelected] = useState(null)
 const destination = location.state?.destination || 'City Library'
 return <><Header/><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><Link to="/search" className="text-sm font-semibold text-blue-800 hover:underline">← Edit route search</Link><div className="mt-5"><p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Route options</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Routes to {destination}</h1><p className="mt-2 text-slate-600">{location.state?.disabilities?.length ? 'Prioritized for your selected access needs.' : 'Choose a route that works best for you.'}</p></div><div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"><section className="grid content-start gap-4" aria-label="Available routes">{ROUTES.map(route => <RouteCard key={route.id} route={route} selected={selected?.id === route.id} onSelect={setSelected}/>)}</section><div className="lg:sticky lg:top-24 lg:self-start"><Map className="min-h-96"/></div></div></main></>
}
