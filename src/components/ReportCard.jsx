export default function ReportCard({ report, onUpvote }) {
  const badge =
    report.verified_by_type === "ngo"
      ? "NGO Verified"
      : report.verified_by_type === "volunteer"
      ? "Volunteer Verified"
      : "User Report";

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
          {badge}
        </span>

        <span className="text-sm text-gray-500">
          {report.upvotes} 👍
        </span>
      </div>

      <p className="mt-3 text-sm">
        {report.description}
      </p>

      <button
        onClick={() => onUpvote?.(report.id)}
        className="mt-3 text-sm font-medium text-blue-600"
      >
        Upvote
      </button>
    </div>
  );
}