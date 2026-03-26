import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Smart narration hook using browser SpeechSynthesis.
 * Auto-selects the highest-quality voice available (prefers Google/Microsoft voices).
 * Completely free, no API keys, no limits.
 */

type NarrationState = "idle" | "speaking" | "paused";

function getBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Priority ranking for natural-sounding English voices
  const priorities = [
    // Google's premium voices (Chrome)
    (v: SpeechSynthesisVoice) =>
      /google.*uk/i.test(v.name) && v.lang.startsWith("en"),
    (v: SpeechSynthesisVoice) =>
      /google.*us/i.test(v.name) && v.lang.startsWith("en"),
    (v: SpeechSynthesisVoice) =>
      /google/i.test(v.name) && v.lang.startsWith("en"),
    // Microsoft neural voices (Edge)
    (v: SpeechSynthesisVoice) =>
      /microsoft.*online/i.test(v.name) && v.lang.startsWith("en"),
    (v: SpeechSynthesisVoice) =>
      /microsoft/i.test(v.name) && v.lang.startsWith("en"),
    // Apple enhanced voices (Safari)
    (v: SpeechSynthesisVoice) => /samantha|daniel|karen|moira/i.test(v.name),
    // Any English voice
    (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
  ];

  for (const test of priorities) {
    const match = voices.find(test);
    if (match) return match;
  }

  return voices[0];
}

export function useNarration() {
  const [state, setState] = useState<NarrationState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1.0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices (they load async in Chrome)
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoicesLoaded(true);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) {
        console.warn("SpeechSynthesis not available in this browser context");
        setError(
          "Speech is not available in this browser. Try opening the published site directly.",
        );
        return;
      }

      window.speechSynthesis.cancel();

      // Strip markdown formatting for cleaner speech
      const cleanText = text
        .replace(/[#*_~`>]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim();

      if (!cleanText) {
        setError("No text to read aloud.");
        console.warn("No text to read aloud.");
        return;
      }

      setError(null);

      // Split text into sentences or chunks (max 200 chars per chunk)
      const sentenceRegex = /[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g;
      const sentences = cleanText.match(sentenceRegex) || [cleanText];
      const chunks = [];
      let current = "";
      for (const sentence of sentences) {
        if ((current + sentence).length > 200 && current.length > 0) {
          chunks.push(current);
          current = sentence;
        } else {
          current += sentence;
        }
      }
      if (current.length > 0) chunks.push(current);

      let chunkIndex = 0;

      const speakChunk = () => {
        if (chunkIndex >= chunks.length) {
          setState("idle");
          console.log("Speech ended");
          return;
        }
        const chunk = chunks[chunkIndex];
        const utterance = new SpeechSynthesisUtterance(chunk);
        const voice = getBestVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1;

        utterance.onstart = () => {
          setState("speaking");
          console.log(
            `Speech started (chunk ${chunkIndex + 1}/${chunks.length})`,
          );
        };
        utterance.onend = () => {
          chunkIndex++;
          speakChunk();
        };
        utterance.onerror = (e) => {
          setState("idle");
          console.error("Speech synthesis error:", e);
          if (e.error === "not-allowed") {
            setError(
              "Speech blocked by browser. Try the published site or click again after a user gesture.",
            );
          } else {
            setError("Speech synthesis error: " + e.error);
          }
        };
        utterance.onpause = () => {
          setState("paused");
          console.log("Speech paused");
        };
        utterance.onresume = () => {
          setState("speaking");
          console.log("Speech resumed");
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        console.log("Speech synthesis invoked (chunk)");
      };

      speakChunk();
    },
    [rate, pitch],
  );

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setState("idle");
  }, []);

  const toggle = useCallback(
    (text: string) => {
      if (state === "speaking") {
        pause();
      } else if (state === "paused") {
        resume();
      } else {
        speak(text);
      }
    },
    [state, speak, pause, resume],
  );

  return {
    state,
    error,
    speak,
    pause,
    resume,
    stop,
    toggle,
    rate,
    setRate,
    pitch,
    setPitch,
    voicesLoaded,
    isSpeaking: state === "speaking",
    isPaused: state === "paused",
    isIdle: state === "idle",
  };
}
