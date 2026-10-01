// Vibration patterns in milliseconds: [vibrate, pause, vibrate, ...].
// Supported on Android browsers; iOS Safari has no Vibration API, so every call is a safe no-op there.
const PATTERNS = {
  press: [50],
  selected: [60],
  cardOpened: [150, 100, 150],
  sosSent: [200, 100, 200, 100, 200],
  success: [100],
  error: [200, 100, 200],
};

export const hapticsSupported = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

export function vibrate(name) {
  if (!hapticsSupported) return false;
  try { return navigator.vibrate(PATTERNS[name] ?? name); } catch { return false; }
}

export function stopVibration() {
  if (hapticsSupported) navigator.vibrate(0);
}
