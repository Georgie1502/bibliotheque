import { useEffect, useState } from "react";

export type Theme = "dark" | "sepia" | "ardoise" | "foret";
export type FontScale = "normal" | "large" | "xlarge";

export interface Preferences {
  theme: Theme;
  fontScale: FontScale;
}

const DEFAULTS: Preferences = { theme: "dark", fontScale: "normal" };
const STORAGE_KEY = "bibliotheque_prefs";

export const usePreferences = () => {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    document.documentElement.setAttribute("data-theme", prefs.theme);
    if (prefs.fontScale === "normal") {
      document.documentElement.removeAttribute("data-font");
    } else {
      document.documentElement.setAttribute("data-font", prefs.fontScale);
    }
  }, [prefs]);

  /** Partial update — also calls the API caller passed in when provided. */
  const update = (partial: Partial<Preferences>) =>
    setPrefs((p) => ({ ...p, ...partial }));

  /** Replace the whole object (e.g. when loading from the API on login). */
  const load = (incoming: Preferences) => setPrefs(incoming);

  return { prefs, update, load };
};
