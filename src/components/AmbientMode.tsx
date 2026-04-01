import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Music, X } from "lucide-react";

// Procedural ambient sound generator using Web Audio API
function createAmbienceNode(ctx: AudioContext, type: string, gainNode: GainNode) {
  const nodes: AudioNode[] = [];

  if (type === "rain" || type === "thunder") {
    // Rain = filtered white noise
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = type === "thunder" ? 600 : 1800;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = type === "thunder" ? 40 : 200;
    noise.connect(lp).connect(hp).connect(gainNode);
    noise.start();
    nodes.push(noise);

    if (type === "thunder") {
      // Add low rumble
      const rumble = ctx.createOscillator();
      rumble.type = "sawtooth";
      rumble.frequency.value = 35;
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.08;
      const rumbleLp = ctx.createBiquadFilter();
      rumbleLp.type = "lowpass";
      rumbleLp.frequency.value = 80;
      rumble.connect(rumbleLp).connect(rumbleGain).connect(gainNode);
      rumble.start();
      nodes.push(rumble);
    }
  } else if (type === "fire") {
    // Crackling = band-pass filtered noise with modulation
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 800;
    bp.Q.value = 0.5;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.6;
    // LFO for crackling effect
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.4;
    lfo.connect(lfoGain).connect(crackleGain.gain);
    lfo.start();
    noise.connect(bp).connect(crackleGain).connect(gainNode);
    noise.start();
    nodes.push(noise, lfo);
  } else if (type === "forest") {
    // Birds = gentle high sine modulation
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 2000 + Math.random() * 2000;
      const modulator = ctx.createOscillator();
      modulator.frequency.value = 3 + Math.random() * 8;
      const modGain = ctx.createGain();
      modGain.gain.value = 500;
      modulator.connect(modGain).connect(osc.frequency);
      const birdGain = ctx.createGain();
      birdGain.gain.value = 0.015;
      osc.connect(birdGain).connect(gainNode);
      osc.start();
      modulator.start();
      nodes.push(osc, modulator);
    }
    // Background wind
    const bufLen = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    }
    const windNoise = ctx.createBufferSource();
    windNoise.buffer = buf;
    windNoise.loop = true;
    const wlp = ctx.createBiquadFilter();
    wlp.type = "lowpass";
    wlp.frequency.value = 500;
    const wg = ctx.createGain();
    wg.gain.value = 0.15;
    windNoise.connect(wlp).connect(wg).connect(gainNode);
    windNoise.start();
    nodes.push(windNoise);
  } else if (type === "ocean") {
    // Ocean = modulated filtered noise
    const bufLen = 2 * ctx.sampleRate;
    const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 800;
    // Wave modulation
    const waveLfo = ctx.createOscillator();
    waveLfo.frequency.value = 0.12;
    const waveDepth = ctx.createGain();
    waveDepth.gain.value = 400;
    waveLfo.connect(waveDepth).connect(lp.frequency);
    waveLfo.start();
    const oceanGain = ctx.createGain();
    oceanGain.gain.value = 0.7;
    noise.connect(lp).connect(oceanGain).connect(gainNode);
    noise.start();
    nodes.push(noise, waveLfo);
  } else if (type === "wind") {
    const bufLen = 2 * ctx.sampleRate;
    const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 400;
    bp.Q.value = 0.3;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain).connect(bp.frequency);
    lfo.start();
    noise.connect(bp).connect(gainNode);
    noise.start();
    nodes.push(noise, lfo);
  } else if (type === "river") {
    // River = mix of filtered noise at different bands
    const bufLen = 2 * ctx.sampleRate;
    const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2500;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 300;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 600;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();
    const riverGain = ctx.createGain();
    riverGain.gain.value = 0.5;
    noise.connect(lp).connect(hp).connect(riverGain).connect(gainNode);
    noise.start();
    nodes.push(noise, lfo);
  } else if (type === "bells") {
    // Church bells = resonant sine tones with decay envelope, re-triggered
    const playBell = () => {
      const freqs = [523, 659, 784, 392];
      const freq = freqs[Math.floor(Math.random() * freqs.length)];
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.15, ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
      osc.connect(bellGain).connect(gainNode);
      osc.start();
      osc.stop(ctx.currentTime + 4);
      // Harmonics
      const harm = ctx.createOscillator();
      harm.type = "sine";
      harm.frequency.value = freq * 2.76;
      const hGain = ctx.createGain();
      hGain.gain.setValueAtTime(0.06, ctx.currentTime);
      hGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      harm.connect(hGain).connect(gainNode);
      harm.start();
      harm.stop(ctx.currentTime + 2.5);
    };
    playBell();
    const interval = setInterval(() => {
      if (ctx.state === "closed") { clearInterval(interval); return; }
      playBell();
    }, 5000 + Math.random() * 3000);
    // Store interval for cleanup
    (gainNode as any)._bellInterval = interval;
  } else if (type === "night") {
    // Night = crickets (high frequency oscillation) + low wind
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 4000 + Math.random() * 1500;
      const mod = ctx.createOscillator();
      mod.frequency.value = 10 + Math.random() * 20;
      const modG = ctx.createGain();
      modG.gain.value = 1;
      mod.connect(modG).connect(osc.frequency);
      const cricketGain = ctx.createGain();
      cricketGain.gain.value = 0.008;
      osc.connect(cricketGain).connect(gainNode);
      osc.start(ctx.currentTime + Math.random() * 2);
      mod.start();
      nodes.push(osc, mod);
    }
    // Low ambient
    const bufLen = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    }
    const n = ctx.createBufferSource();
    n.buffer = buf;
    n.loop = true;
    const nlp = ctx.createBiquadFilter();
    nlp.type = "lowpass";
    nlp.frequency.value = 200;
    const ng = ctx.createGain();
    ng.gain.value = 0.12;
    n.connect(nlp).connect(ng).connect(gainNode);
    n.start();
    nodes.push(n);
  }

  return nodes;
}

const AMBIENCES = [
  { id: "none", label: "Off", icon: "🔇" },
  { id: "rain", label: "Gentle Rain", icon: "🌧️" },
  { id: "fire", label: "Crackling Fire", icon: "🔥" },
  { id: "forest", label: "Forest Birds", icon: "🌲" },
  { id: "ocean", label: "Ocean Waves", icon: "🌊" },
  { id: "wind", label: "Soft Wind", icon: "🍃" },
  { id: "thunder", label: "Thunder", icon: "⛈️" },
  { id: "bells", label: "Church Bells", icon: "🔔" },
  { id: "river", label: "Flowing River", icon: "🏞️" },
  { id: "night", label: "Night Crickets", icon: "🌙" },
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
  const [volume, setVolume] = useState(0.5);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const stopAudio = useCallback(() => {
    // Clean up bell interval if exists
    if (gainRef.current && (gainRef.current as any)._bellInterval) {
      clearInterval((gainRef.current as any)._bellInterval);
    }
    nodesRef.current.forEach((n) => {
      try { (n as any).stop?.(); } catch {}
      try { n.disconnect(); } catch {}
    });
    nodesRef.current = [];
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      ctxRef.current.close().catch(() => {});
    }
    ctxRef.current = null;
    gainRef.current = null;
  }, []);

  const playAmbience = useCallback((id: string) => {
    stopAudio();
    setActiveAmbience(id);
    if (id === "none") return;

    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);

    ctxRef.current = ctx;
    gainRef.current = gain;

    const nodes = createAmbienceNode(ctx, id, gain);
    nodesRef.current = nodes;
  }, [volume, stopAudio]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2.5 rounded-xl hover:bg-parchment-dark/50 transition-all duration-300 group relative"
        title="Ambient Mode"
      >
        <Music className="w-5 h-5 text-foreground group-hover:text-olive transition-colors" />
        {activeAmbience !== "none" && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold animate-pulse" />
        )}
      </button>

      {createPortal(
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
                <div className="mt-2 grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto">
                  {AMBIENCES.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => playAmbience(a.id)}
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

                {/* Volume slider */}
                {activeAmbience !== "none" && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="font-body text-xs text-muted-foreground">Volume</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1 h-1.5 rounded-full accent-gold cursor-pointer"
                    />
                  </div>
                )}

                <p className="font-body text-xs text-muted-foreground/60 mt-4 text-center italic">
                  Ambient sounds create a peaceful reading atmosphere
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
