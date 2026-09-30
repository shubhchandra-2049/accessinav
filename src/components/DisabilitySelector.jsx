import { MOCK_DISABILITIES } from "../lib/constants";

export default function DisabilitySelector({ selected, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {MOCK_DISABILITIES.map((disability) => (
        <button
          key={disability.id}
          onClick={() => onChange(disability.id)}
          className={`rounded-2xl border p-5 text-left transition ${
            selected === disability.id
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="text-3xl">{disability.icon}</div>

          <h3 className="mt-3 font-semibold">
            {disability.name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {disability.description}
          </p>
        </button>
      ))}
    </div>
  );
}