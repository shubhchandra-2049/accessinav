// Plain-language text built from real route fields (never invented): used for step-by-step
// directions (cognitive profile) and spoken guidance (visually impaired profile).

function nextTrainText(route) {
  const next = route.realtime_updates?.next_arrival;
  if (!next) return "";
  return /^\d+ min$/.test(next) ? "The next train is in " + next + "." : "Metro status: " + next + ".";
}

export function routeSteps(route, destination) {
  const place = destination || "your destination";
  if (route.board_at && route.exit_at) {
    return [
      "Go to " + route.board_at + " metro station.",
      ["Take the metro.", nextTrainText(route)].filter(Boolean).join(" "),
      "Ride " + route.stops + (route.stops === 1 ? " stop" : " stops") + " to " + route.exit_at + ".",
      "Get off at " + route.exit_at + ".",
      "Walk to " + place + ".",
    ];
  }
  return [
    "Get ready to travel by " + String(route.mode || "road").toLowerCase() + ".",
    "The trip takes about " + route.duration + ".",
    "You arrive at " + place + ".",
  ];
}

export function routeSummary(route) {
  const parts = [route.mode + ", " + route.duration + "."];
  if (route.board_at && route.exit_at) parts.push("Board at " + route.board_at + ". Get off at " + route.exit_at + ".");
  const next = nextTrainText(route);
  if (next) parts.push(next);
  parts.push(route.accessible ? "Marked accessible." : "Not marked accessible.");
  return parts.join(" ");
}
