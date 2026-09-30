export default function LoadingSpinner({ label = "Loading", size = "md" }) {
  const dimensions = size === "sm" ? "size-4 border-2" : size === "lg" ? "size-10 border-4" : "size-6 border-[3px]";
  return <span className="inline-flex items-center gap-3 text-sm font-medium text-slate-700" role="status" aria-live="polite"><span aria-hidden="true" className={dimensions + " animate-spin rounded-full border-blue-700 border-r-transparent"}/>{label}<span className="sr-only">, please wait</span></span>;
}
