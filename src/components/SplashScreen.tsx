import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { BookOpen, Cross } from "lucide-react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const verseRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"intro" | "verse" | "exit">("intro");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Light rays spread
      tl.from(lightRef.current, {
        scale: 0,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
      });

      // Logo appears
      tl.from(logoRef.current, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1.2,
        ease: "back.out(1.7)",
      }, "-=0.8");

      // Title reveals character by character
      tl.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.4");

      // Subtitle fades up
      tl.from(subtitleRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      }, "-=0.3");

      // Transition to verse phase
      tl.call(() => setPhase("verse"), [], "+=0.5");

      // Show verse
      tl.from(verseRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "+=0.2");

      // Pulsing glow on logo
      tl.to(logoRef.current, {
        boxShadow: "0 0 60px hsl(38 70% 50% / 0.4)",
        duration: 1,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
      }, "-=0.8");

      // Exit animation
      tl.call(() => setPhase("exit"), [], "+=1");
      tl.to(containerRef.current, {
        opacity: 0,
        scale: 1.1,
        duration: 0.8,
        ease: "power2.in",
        onComplete,
      }, "+=0.2");
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-earth overflow-hidden"
    >
      {/* Light rays */}
      <div
        ref={lightRef}
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(38 70% 50% / 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gold/30 animate-float"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Logo */}
      <div
        ref={logoRef}
        className="relative w-24 h-24 rounded-full bg-earth/60 border-2 border-gold/40 flex items-center justify-center mb-8"
        style={{ boxShadow: "0 0 30px hsl(38 70% 50% / 0.2)" }}
      >
        <Cross className="w-10 h-10 text-gold" />
      </div>

      {/* Title */}
      <h1
        ref={titleRef}
        className="font-display text-5xl md:text-7xl font-light text-earth-foreground text-shadow-warm tracking-wide"
      >
        Scripture
      </h1>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        className="font-body text-sm uppercase tracking-[0.4em] text-gold-light/70 mt-4"
      >
        The Living Word
      </p>

      {/* Verse */}
      <div
        ref={verseRef}
        className="mt-12 max-w-lg text-center px-6"
        style={{ opacity: phase === "intro" ? 0 : 1 }}
      >
        <blockquote className="font-display text-lg md:text-xl italic text-earth-foreground/70 leading-relaxed">
          "In the beginning was the Word, and the Word was with God, and the Word was God."
        </blockquote>
        <p className="mt-3 font-body text-xs text-gold-light/50 tracking-widest uppercase">
          John 1:1
        </p>
      </div>
    </div>
  );
}
