import { useState, useCallback } from "react";
import { RefreshCw, Heart, Sun, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import GsapReveal from "@/components/GsapReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { getDailyDevotional, getRandomDevotional, type Devotional } from "@/lib/devotionalData";

export default function DailyDevotional() {
  const [devotional, setDevotional] = useState<Devotional>(getDailyDevotional);
  const [isShuffling, setIsShuffling] = useState(false);
  const [key, setKey] = useState(0);

  const shuffle = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      setDevotional(getRandomDevotional());
      setKey((k) => k + 1);
      setIsShuffling(false);
    }, 400);
  }, []);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />
      <div className="pt-20 pb-16 px-6 max-w-4xl mx-auto">
        <GsapReveal className="text-center mb-12" direction="scale">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-olive/10 border border-gold/15 flex items-center justify-center">
              <Sun className="w-5 h-5 text-gold" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Daily <span className="text-gradient-gold italic">Bread</span>
          </h1>
          <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
            Begin your day with God's Word. A fresh verse, reflection, and prayer.
          </p>
        </GsapReveal>

        <div
          key={key}
          className="space-y-8"
          style={{ opacity: isShuffling ? 0.3 : 1, transition: "opacity 0.3s" }}
        >
          <div className="flex justify-center">
            <span className="ornate-border px-5 py-1.5 rounded-xl font-display text-sm tracking-widest text-olive uppercase">
              {devotional.theme}
            </span>
          </div>

          <GsapReveal direction="scale">
            <div className="ornate-border-hover rounded-2xl bg-card/80 p-8 md:p-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-olive/10 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-5 h-5 text-gold opacity-60" />
              </div>
              <blockquote className="font-display text-xl md:text-3xl font-light text-foreground leading-relaxed italic">
                "{devotional.verse}"
              </blockquote>
              <p className="mt-6 font-body text-muted-foreground font-medium">
                — {devotional.reference}, KJV
              </p>
            </div>
          </GsapReveal>

          <OrnamentDivider className="py-2" />

          <GsapReveal delay={0.15}>
            <div className="ornate-border-hover rounded-2xl bg-gradient-parchment p-8 md:p-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-olive/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-olive" />
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground tracking-wide">Reflection</h2>
              </div>
              <p className="font-body text-base md:text-lg leading-relaxed text-foreground/80">
                {devotional.reflection}
              </p>
            </div>
          </GsapReveal>

          <GsapReveal delay={0.25}>
            <div className="ornate-border-hover rounded-2xl bg-card/60 p-8 md:p-10">
              <h2 className="font-display text-lg font-semibold text-foreground tracking-wide mb-4">
                🙏 Prayer
              </h2>
              <p className="font-body text-base md:text-lg leading-relaxed text-foreground/80 italic">
                {devotional.prayer}
              </p>
            </div>
          </GsapReveal>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={shuffle}
            disabled={isShuffling}
            className="ornate-border-hover px-6 py-3 bg-olive/90 hover:bg-olive text-primary-foreground font-display text-sm tracking-wide rounded-xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isShuffling ? "animate-spin" : ""}`} />
            New Devotional
          </button>
        </div>
      </div>
    </div>
  );
}
