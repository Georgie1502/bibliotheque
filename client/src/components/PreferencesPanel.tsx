import { useState } from "react";
import { FontScale, Preferences, Theme } from "../hooks/usePreferences";

const THEMES: { value: Theme; label: string; swatch: string }[] = [
  { value: "dark",    label: "Nuit",     swatch: "#0f172a" },
  { value: "sepia",   label: "Sépia",    swatch: "#1c1106" },
  { value: "ardoise", label: "Ardoise",  swatch: "#0a0f1a" },
  { value: "foret",   label: "Forêt",    swatch: "#0a1a0f" },
];

const FONT_SCALES: { value: FontScale; label: string }[] = [
  { value: "normal", label: "Aa" },
  { value: "large",  label: "Aa+" },
  { value: "xlarge", label: "Aa++" },
];

type Props = {
  prefs: Preferences;
  onUpdate: (partial: Partial<Preferences>) => void;
};

const PreferencesPanel = ({ prefs, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`text-sm px-3 py-1 rounded-lg border transition-colors ${
          open ? "border-teal text-teal" : "border-white/20 hover:border-white/40"
        }`}
        title="Préférences d'affichage"
        aria-expanded={open}
      >
        ⚙
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-white/20 bg-slate-900 p-4 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Préférences</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-sand/60 hover:text-white text-xs leading-none"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-sand/70 text-xs mb-2">Thème</p>
              <div className="grid grid-cols-2 gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => onUpdate({ theme: t.value })}
                    className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border transition ${
                      prefs.theme === t.value
                        ? "border-teal bg-teal/10 text-white"
                        : "border-white/10 text-sand/80 hover:border-white/25"
                    }`}
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                      style={{ background: t.swatch }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sand/70 text-xs mb-2">Taille du texte</p>
              <div className="flex gap-1.5">
                {FONT_SCALES.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => onUpdate({ fontScale: f.value })}
                    className={`flex-1 text-xs px-2 py-1.5 rounded-lg border transition ${
                      prefs.fontScale === f.value
                        ? "border-teal bg-teal/10 text-white"
                        : "border-white/10 text-sand/80 hover:border-white/25"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PreferencesPanel;
