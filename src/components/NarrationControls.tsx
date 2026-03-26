import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Pause, VolumeX, Settings2, AlertCircle } from "lucide-react";
import { useNarration } from "@/hooks/useNarration";

interface NarrationControlsProps {
  getText: () => string;
  className?: string;
}

export default function NarrationControls({ getText, className = "" }: NarrationControlsProps) {
  const narration = useNarration();
  const [showSettings, setShowSettings] = useState(false);

  // Debug: log narration state and errors
  if (narration.error) {
    console.error("Narration error:", narration.error);
  }

  // Debug: log when Listen button is clicked and what text is passed
  const handleListenClick = () => {
    const text = getText();
    console.log("Listen button clicked. Text:", text);
    narration.toggle(text);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Error message */}
      <AnimatePresence>
        {narration.error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full mb-2 right-0 w-72 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-body flex items-start gap-2 z-50"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {narration.error}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-2">
      {/* Stop button */}
      <AnimatePresence>
        {!narration.isIdle && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={narration.stop}
            className="ornate-border-hover px-4 py-2.5 rounded-xl flex items-center gap-2 font-body text-sm bg-card text-foreground hover:text-destructive transition-all duration-300"
          >
            <VolumeX className="w-4 h-4" />
            Stop
          </motion.button>
        )}
      </AnimatePresence>

      {/* Play/Pause */}
      <button
        onClick={handleListenClick}
        className={`ornate-border-hover px-5 py-2.5 rounded-xl flex items-center gap-2 font-body text-sm transition-all duration-300 ${
          narration.isSpeaking
            ? "bg-olive text-primary-foreground"
            : narration.isPaused
            ? "bg-gold/80 text-earth"
            : "bg-card text-foreground hover:text-olive"
        }`}
      >
        {narration.isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        {narration.isSpeaking ? "Pause" : narration.isPaused ? "Resume" : "Listen"}
      </button>

      {/* Settings toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`p-2.5 rounded-xl border transition-all duration-300 ${
          showSettings
            ? "border-gold/40 bg-gold/10 text-gold"
            : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-gold/30"
        }`}
      >
        <Settings2 className="w-4 h-4" />
      </button>

      {/* Settings popover */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 ornate-border rounded-2xl bg-card/95 backdrop-blur-xl p-5 z-50 shadow-lg"
          >
            <h4 className="font-display text-sm font-semibold text-foreground mb-4 tracking-wide">
              Voice Settings
            </h4>

            {/* Speed */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                  Speed
                </label>
                <span className="font-body text-xs text-gold font-medium">
                  {narration.rate.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={narration.rate}
                onChange={(e) => narration.setRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-olive [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-md"
              />
              <div className="flex justify-between mt-1">
                <span className="font-body text-[10px] text-muted-foreground/60">Slow</span>
                <span className="font-body text-[10px] text-muted-foreground/60">Fast</span>
              </div>
            </div>

            {/* Pitch */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                  Pitch
                </label>
                <span className="font-body text-xs text-gold font-medium">
                  {narration.pitch.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={narration.pitch}
                onChange={(e) => narration.setPitch(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-olive [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-md"
              />
              <div className="flex justify-between mt-1">
                <span className="font-body text-[10px] text-muted-foreground/60">Deep</span>
                <span className="font-body text-[10px] text-muted-foreground/60">High</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
