import { Search as SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DisabilitySelector from '../components/DisabilitySelector.jsx'
import Header from '../components/Header.jsx'
import Map from '../components/Map.jsx'
export default function Search() {
 const [selected, setSelected] = useState([])
 const [destination, setDestination] = useState('')
 const navigate = useNavigate()
 function submit(event) { event.preventDefault(); navigate('/results', { state: { destination, disabilities: selected } }) }
 return <><Header/><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Route planner</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Where would you like to go?</h1><p className="mt-3 text-slate-600">Add a destination and the access needs you want to consider.</p></div><div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"><form onSubmit={submit} className="grid content-start gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><label className="grid gap-2 text-sm font-semibold text-slate-900" htmlFor="destination">Destination<div className="relative"><SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input required id="destination" value={destination} onChange={event => setDestination(event.target.value)} placeholder="Place, address, or landmark" className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-base font-normal focus:border-blue-700 focus:outline-2 focus:outline-blue-700"/></div></label><DisabilitySelector value={selected} onChange={setSelected}/><button className="min-h-12 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Show route options</button></form><div><Map className="h-full min-h-80"/></div></div></main></>
}
