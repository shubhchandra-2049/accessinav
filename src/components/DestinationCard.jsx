import { useEffect, useRef } from "react";
import { Clock3, MapPin, TrainFront, X } from "lucide-react";

function Block({ label, value, accent = false }) {
  return <section className="border-t-4 border-white pt-5">
    <p className="text-lg font-bold uppercase tracking-widest text-yellow-300 sm:text-2xl">{label}</p>
    <p className={"mt-3 break-words font-black leading-tight " + (accent ? "text-5xl sm:text-7xl" : "text-4xl sm:text-6xl")}>{value}</p>
  </section>;
}

/**
 * Full-screen, high-contrast card for deaf and hard-of-hearing travellers: the key facts of the
 * selected route in very large text, no sound needed. Uses real route data only.
 */
export default function DestinationCard({ route, destination, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal(); // native modal: traps focus, Escape closes
    return () => { if (element?.open) element.close(); };
  }, []);

  const metro = Boolean(route.board_at && route.exit_at);
  const realtime = route.realtime_updates || {};
  const sourceLabel = realtime.source === "schedule" ? "timetable" : realtime.source === "estimate" ? "estimate" : null;

  return <dialog ref={dialog} onClose={onClose} aria-labelledby="visual-card-title" className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-black p-0 text-white backdrop:bg-black">
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-8 p-5 sm:p-10">
      <div className="flex items-start justify-between gap-4">
        <h1 id="visual-card-title" className="inline-flex items-center gap-3 text-2xl font-bold uppercase tracking-widest text-yellow-300 sm:text-3xl"><TrainFront size={32} aria-hidden="true"/>{route.mode}</h1>
        <button type="button" autoFocus onClick={() => dialog.current?.close()} className="inline-flex min-h-14 items-center gap-2 rounded-xl border-4 border-white px-5 text-lg font-bold hover:bg-white hover:text-black focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"><X size={26} aria-hidden="true"/>Close</button>
      </div>

      <div className="grid flex-1 content-center gap-8">
        {metro ? <>
          <Block label="Board at" value={route.board_at}/>
          <Block label="Get off at" value={route.exit_at} accent/>
        </> : <Block label="Travel by" value={route.mode} accent/>}
        <Block label="Final destination" value={destination || "Your destination"}/>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3 border-t-4 border-white pt-5 text-2xl font-bold sm:text-3xl">
        <span className="inline-flex items-center gap-3"><Clock3 size={30} aria-hidden="true"/>{route.duration}</span>
        {metro && Number.isFinite(route.stops) && <span className="inline-flex items-center gap-3"><MapPin size={30} aria-hidden="true"/>{route.stops} {route.stops === 1 ? "stop" : "stops"}</span>}
        {realtime.next_arrival && <span>{metro ? "Next train" : "Next"}: {realtime.next_arrival}{sourceLabel ? " (" + sourceLabel + ")" : ""}</span>}
      </div>
    </div>
  </dialog>;
}
