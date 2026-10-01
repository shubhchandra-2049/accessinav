import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PROFILE, PROFILES } from "../lib/constants.js";
import { getMe, saveProfile } from "../lib/api.js";
import { getCurrentUser } from "../lib/auth.js";
import { DisabilityContext } from "./useDisability.js";

const STORAGE_KEY = "userDisabilityProfile";

// What each profile switches on across the app. Components read these flags instead of checking profile ids.
const FEATURES = {
  wheelchair: { stepFree: true, accessInfo: true },
  cognitive: { simplified: true, steps: true },
  hearing_impaired: { visualCard: true, haptics: true },
  visually_impaired: { speech: true, haptics: true },
};

const isProfileId = value => PROFILES.some(profile => profile.id === value);

function readStored() {
  try { const stored = localStorage.getItem(STORAGE_KEY); return isProfileId(stored) ? stored : null; } catch { return null; }
}
function writeStored(id) {
  try { if (id) localStorage.setItem(STORAGE_KEY, id); else localStorage.removeItem(STORAGE_KEY); } catch { /* storage unavailable: the choice lasts for this session */ }
}

/**
 * The accessibility profile.
 * - A profile only counts as "chosen" once the user picks one (the default is never written to storage),
 *   so first-time users can be sent to the profile selector.
 * - While logged in, the account's saved profile (server) is the source of truth; localStorage is a
 *   local cache that is cleared on logout so the next person on this device starts fresh.
 */
export function DisabilityProvider({ children }) {
  const stored = readStored();
  const [selectedProfile, setProfile] = useState(stored || DEFAULT_PROFILE);
  const [profileChosen, setChosen] = useState(Boolean(stored));
  const [profileReady, setReady] = useState(() => !getCurrentUser()); // false while syncing a logged-in user
  const hadUser = useRef(Boolean(getCurrentUser()));

  useEffect(() => { document.documentElement.dataset.profile = selectedProfile; }, [selectedProfile]); // drives index.css

  const adopt = useCallback(id => { setProfile(id); setChosen(true); writeStored(id); }, []);

  // Choose a profile: applied and cached immediately, then saved to the account. Resolves false if the save failed.
  const chooseProfile = useCallback(async id => {
    if (!isProfileId(id)) return false;
    adopt(id);
    if (!getCurrentUser()) return true;
    try { await saveProfile(id); return true; } catch { return false; }
  }, [adopt]);

  useEffect(() => {
    let cancelled = false;
    function sync() {
      const user = getCurrentUser();
      if (!user) {
        if (hadUser.current) { hadUser.current = false; writeStored(null); setProfile(DEFAULT_PROFILE); setChosen(false); } // logged out
        setReady(true);
        return;
      }
      hadUser.current = true;
      setReady(false);
      getMe().then(me => {
        if (cancelled || !("disability_profile" in me)) return; // field absent: backend without profile storage, keep the local choice
        if (isProfileId(me.disability_profile)) adopt(me.disability_profile);
        else { writeStored(null); setProfile(DEFAULT_PROFILE); setChosen(false); } // this account has not chosen yet
      }).catch(() => {}).finally(() => { if (!cancelled) setReady(true); });
    }
    sync();
    window.addEventListener("accessinav:auth-changed", sync);
    return () => { cancelled = true; window.removeEventListener("accessinav:auth-changed", sync); };
  }, [adopt]);

  const value = useMemo(() => ({
    selectedProfile,
    profileChosen,
    profileReady,
    chooseProfile,
    setSelectedProfile: chooseProfile,
    profile: PROFILES.find(profile => profile.id === selectedProfile) || PROFILES[0],
    features: FEATURES[selectedProfile] || {},
  }), [selectedProfile, profileChosen, profileReady, chooseProfile]);

  return <DisabilityContext.Provider value={value}>{children}</DisabilityContext.Provider>;
}
