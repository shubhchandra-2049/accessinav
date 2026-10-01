// Spoken guidance (Web Speech API). Safe no-ops where speech synthesis is unavailable.
export const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text) {
  if (!speechSupported || !text) return false;
  try {
    window.speechSynthesis.cancel(); // never queue up stale announcements
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel();
}
