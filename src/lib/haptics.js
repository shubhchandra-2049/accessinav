// Vibration patterns in milliseconds: [vibrate, pause, vibrate, ...].
// Supported on Android browsers; iOS Safari has no Vibration API, so every call is a safe no-op there.
const PATTERNS = {
  selected: [60],
  cardOpened: [150, 100, 150],
  sosSent: [200, 100, 200, 100, 200],
  success: [50, 100, 100, 100, 150],
  error: [300, 100, 100, 100, 50],
};

export const hapticsSupported = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

export function vibrate(name) {
  if (!hapticsSupported) return false;
  try { return navigator.vibrate(PATTERNS[name] ?? name); } catch { return false; }
}

export function stopVibration() {
  if (hapticsSupported) navigator.vibrate(0);
}
