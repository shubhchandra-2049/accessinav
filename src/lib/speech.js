// Spoken guidance (Web Speech API, no backend). Safe no-ops where speech synthesis is unavailable.
export const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

const RATE = 0.9;   // slower than normal, for clarity
const PITCH = 1.0;
const VOLUME = 1.0;

// Prefer Indian English (Chennai), then any English voice; otherwise the browser default for the language.
function pickVoice() {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.find(voice => voice.lang === "en-IN") || voices.find(voice => voice.lang?.toLowerCase().startsWith("en")) || null;
  } catch { return null; }
}

export function speak(text) {
  if (!speechSupported || !text) return false;
  try {
    window.speechSynthesis.cancel(); // never queue up stale announcements
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = RATE;
    utterance.pitch = PITCH;
    utterance.volume = VOLUME;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel();
}
