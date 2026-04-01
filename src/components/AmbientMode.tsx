import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, X, Volume2, VolumeX } from "lucide-react";

const AMBIENCES = [
  { id: "none", label: "Off", icon: "🔇" },
  { id: "rain", label: "Gentle Rain", icon: "🌧️" },
  { id: "fire", label: "Crackling Fire", icon: "🔥" },
  { id: "forest", label: "Forest Birds", icon: "🌲" },
  { id: "ocean", label: "Ocean Waves", icon: "🌊" },
  { id: "wind", label: "Soft Wind", icon: "🍃" },
];

const READING_THEMES = [
  { id: "default", label: "Parchment", bg: "bg-background", text: "text-foreground" },
  { id: "sepia", label: "Sepia", bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-900 dark:text-amber-100" },
  { id: "night", label: "Night", bg: "bg-slate-900", text: "text-slate-200" },
  { id: "sage", label: "Sage", bg: "bg-green-50 dark:bg-green-950", text: "text-green-900 dark:text-green-100" },
];

interface AmbientModeProps {
  onThemeChange?: (themeId: string) => void;
  currentTheme?: string;
}

export default function AmbientMode({ onThemeChange, currentTheme = "default" }: AmbientModeProps) {
  const [open, setOpen] = useState(false);
  const [activeAmbience, setActiveAmbience] = useState("none");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2.5 rounded-xl hover:bg-parchment-dark/50 transition-all duration-300 group"
        title="Ambient Mode"
      >
        <Music className="w-5 h-5 text-foreground group-hover:text-olive transition-colors" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm ornate-border rounded-2xl bg-card p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl text-foreground">Reading Mode</h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Reading Theme */}
              <label className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                Reading Theme
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 mb-6">
                {READING_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onThemeChange?.(t.id)}
                    className={`px-3 py-3 rounded-xl font-body text-xs transition-all duration-200 border ${
                      currentTheme === t.id
                        ? "border-gold bg-olive/10 text-foreground"
                        : "border-border hover:border-gold/30 text-muted-foreground"
                    }`}
                  >
                    <div className={`w-full h-4 rounded ${t.bg} mb-2 border border-border/50`} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Ambience */}
              <label className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                Background Ambience
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {AMBIENCES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setActiveAmbience(a.id)}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl font-body text-xs transition-all duration-200 border ${
                      activeAmbience === a.id
                        ? "border-gold bg-olive/10 text-foreground"
                        : "border-border hover:border-gold/30 text-muted-foreground"
                    }`}
                  >
                    <span className="text-lg">{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>

              <p className="font-body text-xs text-muted-foreground/60 mt-4 text-center italic">
                Ambient sounds create a peaceful reading atmosphere
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
