import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDisability } from "../context/useDisability.js";
import { speak } from "../lib/speech.js";
import { vibrate } from "../lib/haptics.js";
import { PROFILE_FREE_PATHS } from "../lib/constants.js";

const PAGE_TITLES = {
  "/": "Welcome to AccessiNav",
  "/login": "Log in",
  "/signup": "Create an account",
  "/select-disability": "Choose your accessibility profile",
  "/home": "Home",
  "/search": "Find an accessible route",
  "/results": "Route results",
  "/report": "Report an issue",
  "/volunteer": "Volunteer dashboard",
  "/ngo": "Organization dashboard",
  "/settings": "Accessibility profile settings",
};

/** App-wide behaviour: a title for every page, spoken page names and button/error vibration for the spoken profile. */
export default function AppEffects() {
  const { pathname } = useLocation();
  const { features: profileFeatures } = useDisability();
  // Sign-in / sign-up / setup pages are always normal: no spoken titles or vibration there.
  const features = PROFILE_FREE_PATHS.includes(pathname) ? {} : profileFeatures;

  // Every page gets a title (for screen readers and browser history); it is spoken for the spoken profile.
  // Results announces itself once its routes load, so it is skipped here.
  useEffect(() => {
    const title = PAGE_TITLES[pathname] || "AccessiNav";
    document.title = title + " · AccessiNav";
    if (features.pageAnnounce && pathname !== "/results") speak(title + " page");
  }, [pathname, features.pageAnnounce]);

  // Vibrate when a control is pressed, and when an error message appears.
  useEffect(() => {
    if (!features.buttonHaptics) return undefined;
    const onClick = event => { if (event.target.closest?.('button, a, [role="button"], input[type="radio"], input[type="checkbox"], select')) vibrate("press"); };
    document.addEventListener("click", onClick, true);
    const observer = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType === 1 && (node.matches?.('[role="alert"]') || node.querySelector?.('[role="alert"]'))) { vibrate("error"); return; }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { document.removeEventListener("click", onClick, true); observer.disconnect(); };
  }, [features.buttonHaptics]);

  return null;
}
