export function SuccessMessage({ title, children, action }) {
  return <div role="status" aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><p className="font-semibold">{title}</p>{children && <p className="mt-1 text-sm leading-6">{children}</p>}{action}</div>;
}
export function EmptyState({ title, children, action }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center"><h2 className="text-lg font-semibold text-slate-900">{title}</h2>{children && <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{children}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}
