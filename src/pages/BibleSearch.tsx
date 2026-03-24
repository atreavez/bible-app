import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, BookOpen, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";

interface SearchResult {
  reference: string;
  text: string;
  translation_name: string;
}

export default function BibleSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(query.trim())}?translation=kjv`
      );
      if (!response.ok) throw new Error("Not found");
      const data = await response.json();

      if (data.verses) {
        setResults(
          data.verses.map((v: any) => ({
            reference: `${v.book_name} ${v.chapter}:${v.verse}`,
            text: v.text,
            translation_name: data.translation_name || "KJV",
          }))
        );
      } else if (data.text) {
        setResults([
          {
            reference: data.reference,
            text: data.text,
            translation_name: data.translation_name || "KJV",
          },
        ]);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "John 3:16",
    "Psalm 23",
    "Romans 8:28",
    "Philippians 4:13",
    "Isaiah 40:31",
    "Jeremiah 29:11",
    "Proverbs 3:5-6",
    "Matthew 11:28",
  ];

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-16 px-6 max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SearchIcon className="w-5 h-5 text-gold" />
            <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Bible Search
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Search the <span className="text-gradient-gold italic">Scriptures</span>
          </h1>
          <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
            Look up any verse by reference — e.g. "John 3:16", "Psalm 23", or "Romans 8:28-39"
          </p>
        </ScrollReveal>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="ornate-border-hover rounded-sm bg-card/80 backdrop-blur-sm p-2 flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a verse reference..."
                className="w-full bg-background border border-border rounded-sm pl-12 pr-4 py-3 font-body text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-gold/50"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-olive hover:bg-olive-dark text-primary-foreground font-display text-sm tracking-wide rounded-sm transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
              Search
            </motion.button>
          </div>
        </form>

        {/* Quick suggestions */}
        {!searched && (
          <ScrollReveal delay={0.2}>
            <div className="mb-12">
              <p className="font-body text-sm text-muted-foreground mb-3 text-center">
                Try these popular verses:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setQuery(s);
                      // Auto-search
                      setTimeout(() => {
                        const form = document.querySelector("form");
                        form?.requestSubmit();
                      }, 50);
                    }}
                    className="ornate-border px-4 py-2 font-body text-sm text-foreground/70 hover:text-olive hover:border-gold/50 rounded-sm transition-all duration-300 cursor-pointer"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </motion.div>
          ) : searched && results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-body text-sm text-muted-foreground mb-4">
                Found {results.length} verse{results.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-4">
                {results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="ornate-border-hover rounded-sm bg-card/80 backdrop-blur-sm p-6 group"
                  >
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-4 h-4 text-olive mt-1.5 flex-shrink-0 group-hover:text-gold transition-colors" />
                      <div>
                        <p className="font-display text-sm font-semibold text-olive mb-1">
                          {result.reference}
                        </p>
                        <p className="font-body text-base leading-relaxed text-foreground/85">
                          {result.text}
                        </p>
                        <p className="mt-2 font-body text-xs text-muted-foreground">
                          {result.translation_name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : searched ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="font-display text-xl text-muted-foreground">No verses found</p>
              <p className="mt-2 font-body text-sm text-muted-foreground/70">
                Try a specific reference like "Genesis 1:1" or "Psalm 23"
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
