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

// Units spelled out so speech engines read them naturally ("34 minutes", "14.5 kilometres").
export function speakable(text) {
  return String(text).replace(/(\d+(?:\.\d+)?)\s*km\b/g, "$1 kilometres").replace(/(\d+)\s*min\b/g, (m, n) => n + (n === "1" ? " minute" : " minutes"));
}

export function routeSummary(route) {
  const parts = [route.mode + ", " + route.duration + ", " + route.distance + "."];
  if (route.board_at && route.exit_at) parts.push("Board at " + route.board_at + ". Get off at " + route.exit_at + ", " + route.stops + (route.stops === 1 ? " stop" : " stops") + ".");
  const next = nextTrainText(route);
  if (next) parts.push(next);
  parts.push(route.accessible ? "Marked accessible." : "Not marked accessible.");
  return speakable(parts.join(" "));
}
