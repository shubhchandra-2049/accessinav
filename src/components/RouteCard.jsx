export default function RouteCard({ route, onSelect }) {
  return (
    <button
      onClick={() => onSelect?.(route)}
      className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{route.mode}</h3>
          <p className="text-sm text-gray-500">
            {route.distance}
          </p>
        </div>

        <div className="text-right">
          <p className="font-bold">{route.duration}</p>
          <p className="text-sm text-green-600">
            ♿ Accessible
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-sm text-gray-600">
        <span>{route.steps} steps</span>
        <span>{route.stops} stops</span>
        <span>
          {route.realtime_updates.next_arrival}
        </span>
      </div>

      {route.realtime_updates.delay_min > 0 && (
        <div className="mt-3 rounded-lg bg-yellow-50 p-2 text-sm text-yellow-700">
          {route.realtime_updates.delay_min} min delay
        </div>
      )}
    </button>
  );
}