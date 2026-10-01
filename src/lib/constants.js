// Accessibility profiles: a saved user preference (Settings) that also sets the default for route search.
// `id` is stored in localStorage; `searchValue` is the `disability` parameter sent to the routes API.
export const PROFILES = [
  { id: "wheelchair", searchValue: "wheelchair", name: "Wheelchair", description: "Step-free routes, plus lift, ramp and accessible-toilet information from community reports.", searchDescription: "Step-free routes, ramps, and elevator access" },
  { id: "cognitive", searchValue: "cognitive", name: "Cognitive", description: "Simpler screens: fewer route options, larger text and clear step-by-step directions.", searchDescription: "Fewer options and clear step-by-step directions" },
  { id: "hearing_impaired", searchValue: "hearing", name: "Hearing impaired", description: "A full-screen visual route card, vibration patterns and text alerts. No audio needed.", searchDescription: "Visual alerts and written travel information" },
  { id: "visually_impaired", searchValue: "visual", name: "Visually impaired", description: "Spoken guidance, vibration patterns and a high-contrast, larger-text display.", searchDescription: "Spoken guidance, vibration and high contrast" },
];

export const DEFAULT_PROFILE = "wheelchair";

// The profile id for a route-search value ("visual" -> "visually_impaired"); null if unknown.
export const profileIdForSearchValue = value => PROFILES.find(profile => profile.searchValue === value)?.id ?? null;

// Pages shown before a profile is in use. They always look normal: no profile theme, spoken titles or haptics.
export const PROFILE_FREE_PATHS = ["/", "/login", "/signup", "/select-disability"];

// Options for the route-search selector (the same four profiles).
export const ACCESSIBILITY_OPTIONS = PROFILES.map(profile => ({ id: profile.searchValue, name: profile.name, description: profile.searchDescription }));
