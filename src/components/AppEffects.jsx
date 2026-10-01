import { useEffect, useRef } from "react";
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
  // The name is spoken when the page changes, not when a setting changes (that would cut off other announcements,
  // e.g. the confirmation when voice is turned back on).
  const lastPage = useRef("");
  useEffect(() => {
    const title = PAGE_TITLES[pathname] || "AccessiNav";
    document.title = title + " · AccessiNav";
    const changed = lastPage.current !== pathname;
    lastPage.current = pathname;
    if (changed && features.pageAnnounce && pathname !== "/results") speak(title + " page");
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

  // Spoken guidance: the name of a pressed control, and error / status messages as they appear.
  // Links are not announced (the page name is spoken when the new page opens).
  useEffect(() => {
    if (!features.speech) return undefined;
    const clean = text => String(text || "").replace(/\s+/g, " ").trim();
    const onClick = event => {
      const control = event.target.closest?.('button, input[type="radio"], input[type="checkbox"], select');
      if (!control) return;
      const name = control.matches("input, select") ? clean(control.getAttribute("aria-label") || control.closest("label")?.textContent) : clean(control.getAttribute("aria-label") || control.textContent);
      if (name) speak(name);
    };
    document.addEventListener("click", onClick, true);
    const MESSAGE = '[role="alert"], [role="status"]';
    const observer = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        const element = node.nodeType === 1 ? node : node.parentElement;
        const region = element?.closest?.(MESSAGE) || element?.querySelector?.(MESSAGE);
        const text = clean(region?.textContent);
        if (!text) continue;
        speak(region.getAttribute("role") === "alert" ? "Error: " + text : text);
        return;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { document.removeEventListener("click", onClick, true); observer.disconnect(); };
  }, [features.speech]);

  return null;
}
