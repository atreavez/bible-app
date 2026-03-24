import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { bibleStories } from "@/lib/bibleData";

export default function BibleStories() {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const activeStory = bibleStories.find((s) => s.id === selectedStory);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-16 px-6 max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
              AI-Powered Stories
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Stories of <span className="text-gradient-gold italic">Faith</span>
          </h1>
          <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
            The greatest stories ever told, beautifully narrated and brought to life.
          </p>
        </ScrollReveal>

        <AnimatePresence mode="wait">
          {selectedStory && activeStory ? (
            <motion.div
              key="story-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <button
                onClick={() => setSelectedStory(null)}
                className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-olive transition-colors mb-8 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to all stories
              </button>

              <div className="ornate-border rounded-sm bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-48 bg-gradient-earth flex items-center justify-center text-7xl">
                  {activeStory.image}
                </div>
                <div className="p-8 md:p-12">
                  <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                    {activeStory.book} {activeStory.chapter}
                  </span>
                  <h2 className="mt-2 font-display text-3xl md:text-4xl font-medium text-foreground">
                    {activeStory.title}
                  </h2>
                  <OrnamentDivider className="py-4" />
                  <p className="font-body text-lg leading-relaxed text-foreground/80">
                    {activeStory.description}
                  </p>
                  <p className="mt-6 font-body text-base leading-relaxed text-foreground/70">
                    This story is one of the most beloved passages in all of scripture. It speaks
                    to the enduring power of faith, the mercy of God, and the triumph of good
                    over adversity. Through generations, believers have found comfort and
                    inspiration in these words.
                  </p>
                  <p className="mt-4 font-body text-base leading-relaxed text-foreground/70">
                    The narrative unfolds with vivid imagery and timeless lessons that continue to
                    resonate with readers across cultures and centuries. Each verse carries weight
                    and meaning that rewards careful study and reflection.
                  </p>

                  <div className="mt-8 flex gap-4">
                    <Link
                      to="/read"
                      className="ornate-border-hover px-6 py-3 bg-olive/90 hover:bg-olive text-primary-foreground font-display text-sm tracking-wide rounded-sm flex items-center gap-2 transition-all duration-300"
                    >
                      <BookOpen className="w-4 h-4" />
                      Read in Bible
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="story-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bibleStories.map((story, i) => (
                  <ScrollReveal key={story.id} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      onClick={() => setSelectedStory(story.id)}
                      className="ornate-border-hover rounded-sm overflow-hidden bg-card/80 backdrop-blur-sm cursor-pointer group"
                    >
                      <div className="h-36 bg-gradient-earth flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-700">
                        {story.image}
                      </div>
                      <div className="p-6">
                        <span className="font-body text-xs text-muted-foreground">
                          {story.book} {story.chapter}
                        </span>
                        <h3 className="mt-1 font-display text-xl font-semibold text-foreground group-hover:text-olive transition-colors duration-300">
                          {story.title}
                        </h3>
                        <p className="mt-2 font-body text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {story.description}
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-olive/70 group-hover:text-gold transition-colors duration-300">
                          <Sparkles className="w-3 h-3" />
                          <span className="font-body text-xs">AI Enhanced</span>
                        </div>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
