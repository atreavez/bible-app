import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Heart, Sun, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { getDailyDevotional, getRandomDevotional, type Devotional } from "@/lib/devotionalData";

export default function DailyDevotional() {
  const [devotional, setDevotional] = useState<Devotional>(getDailyDevotional);
  const [isShuffling, setIsShuffling] = useState(false);

  const shuffle = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      setDevotional(getRandomDevotional());
      setIsShuffling(false);
    }, 400);
  }, []);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-16 px-6 max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-gold" />
            <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Daily Devotional
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Daily <span className="text-gradient-gold italic">Bread</span>
          </h1>
          <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
            Begin your day with God's Word. A fresh verse, reflection, and prayer to nourish your soul.
          </p>
        </ScrollReveal>

        <motion.div
          key={devotional.reference}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isShuffling ? 0 : 1, y: isShuffling ? -10 : 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Theme badge */}
          <div className="flex justify-center">
            <span className="ornate-border px-5 py-1.5 font-display text-sm tracking-widest text-olive uppercase">
              {devotional.theme}
            </span>
          </div>

          {/* Verse Card */}
          <div className="ornate-border-hover rounded-sm bg-card/80 backdrop-blur-sm p-8 md:p-12 text-center">
            <BookOpen className="w-6 h-6 text-gold mx-auto mb-6 opacity-60" />
            <blockquote className="font-display text-xl md:text-3xl font-light text-foreground leading-relaxed italic">
              "{devotional.verse}"
            </blockquote>
            <p className="mt-6 font-body text-muted-foreground font-medium">
              — {devotional.reference}, KJV
            </p>
          </div>

          <OrnamentDivider className="py-2" />

          {/* Reflection */}
          <div className="ornate-border-hover rounded-sm bg-gradient-parchment p-8 md:p-10">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-olive" />
              <h2 className="font-display text-lg font-semibold text-foreground tracking-wide">
                Reflection
              </h2>
            </div>
            <p className="font-body text-base md:text-lg leading-relaxed text-foreground/80">
              {devotional.reflection}
            </p>
          </div>

          {/* Prayer */}
          <div className="ornate-border-hover rounded-sm bg-card/60 backdrop-blur-sm p-8 md:p-10">
            <h2 className="font-display text-lg font-semibold text-foreground tracking-wide mb-4">
              🙏 Prayer
            </h2>
            <p className="font-body text-base md:text-lg leading-relaxed text-foreground/80 italic">
              {devotional.prayer}
            </p>
          </div>
        </motion.div>

        {/* Shuffle button */}
        <div className="mt-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shuffle}
            disabled={isShuffling}
            className="ornate-border-hover px-6 py-3 bg-olive/90 hover:bg-olive text-primary-foreground font-display text-sm tracking-wide rounded-sm flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isShuffling ? "animate-spin" : ""}`} />
            New Devotional
          </motion.button>
        </div>
      </div>
    </div>
  );
}
