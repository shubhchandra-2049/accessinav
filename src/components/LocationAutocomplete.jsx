import { useEffect, useId, useRef, useState } from "react";
import { LoaderCircle, MapPin, TrainFront } from "lucide-react";
import { searchPlaces } from "../lib/mapbox.js";

/**
 * Accessible place autocomplete (ARIA combobox).
 * value/onChange are the text; onSelect receives {name, latitude, longitude} or null when the text is edited.
 */
export default function LocationAutocomplete({ label, value, onChange, onSelect, placeholder }) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapper = useRef(null);
  const timer = useRef(null);
  const controller = useRef(null);

  useEffect(() => {
    const close = event => { if (!wrapper.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => { document.removeEventListener("pointerdown", close); clearTimeout(timer.current); controller.current?.abort(); };
  }, []);

  function handleChange(event) {
    const text = event.target.value;
    onChange(text);
    onSelect?.(null);
    clearTimeout(timer.current);
    controller.current?.abort();
    if (text.trim().length < 2) { setSuggestions([]); setOpen(false); setLoading(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      controller.current = new AbortController();
      try {
        const results = await searchPlaces(text, { signal: controller.current.signal });
        setSuggestions(results); setActive(-1); setOpen(true); setLoading(false);
      } catch (error) { if (error.name !== "AbortError") setLoading(false); }
    }, 300);
  }

  function choose(place) {
    onChange(place.name);
    onSelect?.({ name: place.name, latitude: place.latitude, longitude: place.longitude });
    setOpen(false);
    setSuggestions([]);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") { setOpen(false); return; }
    if (!open || !suggestions.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive(index => (index + 1) % suggestions.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(index => (index <= 0 ? suggestions.length - 1 : index - 1)); }
    else if (event.key === "Enter" && active >= 0) { event.preventDefault(); choose(suggestions[active]); }
  }

  const showEmpty = open && !loading && suggestions.length === 0 && value.trim().length >= 2;
  return <div ref={wrapper} className="relative grid gap-2 text-sm font-semibold">
    <label htmlFor={listId + "-input"}>{label}</label>
    <div className="relative">
      <input id={listId + "-input"} required role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={active >= 0 ? listId + "-" + active : undefined} autoComplete="off" value={value} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => suggestions.length && setOpen(true)} placeholder={placeholder} className="min-h-12 w-full rounded-xl border border-slate-300 px-3 pr-10 font-normal focus-visible:outline-2 focus-visible:outline-blue-700"/>
      {loading && <LoaderCircle size={18} aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-700"/>}
    </div>
    {open && suggestions.length > 0 && <ul id={listId} role="listbox" aria-label={label + " suggestions"} className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
      {suggestions.map((place, index) => <li key={place.id} id={listId + "-" + index} role="option" aria-selected={index === active}>
        <button type="button" onClick={() => choose(place)} onMouseEnter={() => setActive(index)} className={"flex min-h-12 w-full items-start gap-3 px-3 py-2 text-left font-normal " + (index === active ? "bg-blue-50" : "hover:bg-slate-50")}>
          {place.type === "metro" ? <TrainFront size={16} aria-hidden="true" className="mt-1 shrink-0 text-blue-700"/> : <MapPin size={16} aria-hidden="true" className="mt-1 shrink-0 text-slate-500"/>}
          <span className="min-w-0"><span className="block truncate font-semibold text-slate-900">{place.name}</span><span className="block truncate text-xs text-slate-500">{place.detail}</span></span>
        </button>
      </li>)}
    </ul>}
    {showEmpty && <p role="status" className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal text-slate-600 shadow-lg">No places found for “{value}”. Try a nearby landmark or metro station.</p>}
  </div>;
}
