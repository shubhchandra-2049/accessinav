import { Siren } from 'lucide-react'
export default function SOSButton({ onConfirm = () => {} }) {
 function handleClick() { if (window.confirm('This is a demo SOS action. No emergency services will be contacted. Continue?')) { onConfirm(); window.alert('Demo SOS activated. No call was placed.') } }
 return <button type="button" onClick={handleClick} aria-label="Open emergency SOS demo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-bold text-white shadow-sm hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"><Siren size={20} aria-hidden="true" />SOS</button>
}
