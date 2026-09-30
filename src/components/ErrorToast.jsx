import { AlertCircle, X } from 'lucide-react'
export default function ErrorToast({ message, onClose = () => {} }) {
 if (!message) return null
 return <div role="alert" className="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-white p-4 text-red-950 shadow-lg"><AlertCircle className="mt-0.5 shrink-0 text-red-700" size={20} aria-hidden="true" /><p className="flex-1 text-sm font-medium leading-5">{message}</p><button type="button" onClick={onClose} aria-label="Dismiss error notification" className="grid size-8 shrink-0 place-items-center rounded-lg text-red-800 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700"><X size={18} /></button></div>
}
