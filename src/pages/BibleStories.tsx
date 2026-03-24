import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { bibleStories } from "@/lib/bibleData";
import { supabase } from "@/integrations/supabase/client";

export default function BibleStories() {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [aiNarrative, setAiNarrative] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStories, setGeneratedStories] = useState<Record<string, string>>({});

  const activeStory = bibleStories.find((s) => s.id === selectedStory);

  const generateStory = useCallback(async () => {
    if (!activeStory) return;

    // Check cache
    if (generatedStories[activeStory.id]) {
      setAiNarrative(generatedStories[activeStory.id]);
      return;
    }

    setIsGenerating(true);
    setAiNarrative("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bible-story`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            storyTitle: activeStory.title,
            storyBook: activeStory.book,
            storyChapter: activeStory.chapter,
            storyDescription: activeStory.description,
          }),
        }
      );

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to generate story");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAiNarrative(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setGeneratedStories((prev) => ({ ...prev, [activeStory.id]: fullText }));
    } catch (error) {
      console.error("AI generation error:", error);
      setAiNarrative("*Unable to generate the story at this time. Please try again later.*");
    } finally {
      setIsGenerating(false);
    }
  }, [activeStory, generatedStories]);

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
            The greatest stories ever told, brought to life with AI narration.
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
                onClick={() => {
                  setSelectedStory(null);
                  setAiNarrative("");
                }}
                className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-olive transition-colors mb-8 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to all stories
              </button>

              <div className="ornate-border rounded-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
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

                  {/* AI Narrative */}
                  {aiNarrative ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8 ornate-border rounded-2xl bg-parchment/50 p-6 md:p-8"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-gold" />
                        <span className="font-display text-sm font-semibold text-olive tracking-wide">
                          AI-Generated Narrative
                        </span>
                      </div>
                      <div className="font-body text-base leading-relaxed text-foreground/80 prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/80">
                        <ReactMarkdown>{aiNarrative}</ReactMarkdown>
                      </div>
                      {isGenerating && (
                        <div className="mt-4 flex items-center gap-2 text-gold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="font-body text-xs">Writing...</span>
                        </div>
                      )}
                    </motion.div>
                  ) : null}

                  <div className="mt-8 flex flex-wrap gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={generateStory}
                      disabled={isGenerating}
                      className="ornate-border-hover px-6 py-3 bg-gold/90 hover:bg-gold text-earth font-display text-sm tracking-wide rounded-2xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {aiNarrative ? "Regenerate Story" : "Generate AI Narrative"}
                    </motion.button>
                    <Link
                      to="/read"
                      className="ornate-border-hover px-6 py-3 bg-olive/90 hover:bg-olive text-primary-foreground font-display text-sm tracking-wide rounded-2xl flex items-center gap-2 transition-all duration-300"
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
                      className="ornate-border-hover rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm cursor-pointer group"
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
