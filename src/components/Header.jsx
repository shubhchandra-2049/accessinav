import { Accessibility, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [{ to: '/home', label: 'Home' }, { to: '/search', label: 'Search' }, { to: '/report', label: 'Report Issue' }]
export default function Header() {
  const [open, setOpen] = useState(false)
  const classes = ({ isActive }) => 'rounded-lg px-3 py-2 text-sm font-semibold hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ' + (isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600')
  const nav = <>{links.map(link => <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className={classes}>{link.label}</NavLink>)}</>
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"><Link to="/home" className="flex items-center gap-2 rounded-lg text-lg font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-700"><span className="grid size-9 place-items-center rounded-xl bg-blue-700 text-white"><Accessibility size={21} aria-hidden="true" /></span>AccessiNav</Link><nav aria-label="Main navigation" className="hidden items-center gap-1 sm:flex">{nav}</nav><button type="button" className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700 sm:hidden" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>{open && <nav aria-label="Mobile navigation" className="grid gap-1 border-t px-4 py-3 sm:hidden">{nav}</nav>}</header>
}
