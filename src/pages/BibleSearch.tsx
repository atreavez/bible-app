import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, BookOpen, Loader2, Share2, Copy, Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import GsapReveal from "@/components/GsapReveal";
import { bibleBooks } from "@/lib/bibleData";
import VerseShareCard from "@/components/VerseShareCard";

interface SearchResult {
  reference: string;
  text: string;
  translation_name: string;
}

const POPULAR_VERSES = [
  "John 3:16", "Psalm 23", "Romans 8:28", "Philippians 4:13",
  "Isaiah 40:31", "Jeremiah 29:11", "Proverbs 3:5-6", "Matthew 11:28",
  "Genesis 1:1", "Psalm 119:105", "Romans 12:2", "Galatians 5:22",
  "Ephesians 2:8-9", "Hebrews 11:1", "James 1:5", "1 John 4:8",
];

function generateSuggestions(query: string): string[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();

  const suggestions: string[] = [];

  // Match book names
  for (const book of bibleBooks) {
    if (book.name.toLowerCase().startsWith(q) || book.abbreviation.toLowerCase().startsWith(q)) {
      suggestions.push(`${book.name} 1`);
      if (book.chapters > 1) suggestions.push(`${book.name} ${Math.ceil(book.chapters / 2)}`);
      if (suggestions.length >= 6) break;
    }
  }

  // Match popular verses
  for (const v of POPULAR_VERSES) {
    if (v.toLowerCase().includes(q) && !suggestions.includes(v)) {
      suggestions.push(v);
      if (suggestions.length >= 6) break;
    }
  }

  // If user typed something like "John 3", suggest chapter:verse combos
  const bookMatch = bibleBooks.find(b =>
    q.startsWith(b.name.toLowerCase()) || q.startsWith(b.abbreviation.toLowerCase())
  );
  if (bookMatch) {
    const afterBook = q.replace(bookMatch.name.toLowerCase(), "").replace(bookMatch.abbreviation.toLowerCase(), "").trim();
    const chapterNum = parseInt(afterBook);
    if (chapterNum && chapterNum <= bookMatch.chapters) {
      const base = `${bookMatch.name} ${chapterNum}`;
      if (!suggestions.includes(base)) suggestions.unshift(base);
      for (let v = 1; v <= Math.min(5, 30); v++) {
        const ref = `${bookMatch.name} ${chapterNum}:${v}`;
        if (!suggestions.includes(ref)) suggestions.push(ref);
        if (suggestions.length >= 8) break;
      }
    }
  }

  return suggestions.slice(0, 6);
}

export default function BibleSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => generateSuggestions(query), [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setShowSuggestions(false);
    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(searchQuery.trim())}?translation=kjv`);
      if (!response.ok) throw new Error("Not found");
      const data = await response.json();
      if (data.verses) {
        setResults(data.verses.map((v: any) => ({
          reference: `${v.book_name} ${v.chapter}:${v.verse}`,
          text: v.text,
          translation_name: data.translation_name || "KJV",
        })));
      } else if (data.text) {
        setResults([{ reference: data.reference, text: data.text, translation_name: data.translation_name || "KJV" }]);
      } else {
        setResults([]);
      }
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />
      <div className="pt-20 pb-16 px-6 max-w-4xl mx-auto">
        <GsapReveal className="text-center mb-10" direction="scale">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-olive/10 border border-gold/15 flex items-center justify-center">
              <SearchIcon className="w-5 h-5 text-gold" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Search the <span className="text-gradient-gold italic">Scriptures</span>
          </h1>
          <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
            Look up any verse by reference — e.g. "John 3:16", "Psalm 23", or "Romans 8:28-39"
          </p>
        </GsapReveal>

        <form onSubmit={handleSearch} className="mb-8 relative">
          <div className="ornate-border-hover rounded-2xl bg-card/80 p-2 flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Enter a verse reference..."
                className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-olive hover:bg-olive-dark text-primary-foreground font-display text-sm tracking-wide rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
              Search
            </button>
          </div>

          {/* Autocomplete Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => doSearch(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border/30 last:border-0"
                  >
                    <BookOpen className="w-4 h-4 text-olive flex-shrink-0" />
                    <span className="font-body text-sm text-foreground">{s}</span>
                    <span className="ml-auto font-body text-xs text-muted-foreground">KJV</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {!searched && (
          <GsapReveal delay={0.2}>
            <div className="mb-12">
              <p className="font-body text-sm text-muted-foreground mb-3 text-center">Try these popular verses:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_VERSES.slice(0, 8).map((s) => (
                  <button
                    key={s}
                    onClick={() => doSearch(s)}
                    className="ornate-border px-4 py-2 font-body text-sm text-foreground/70 hover:text-olive hover:border-gold/50 rounded-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </GsapReveal>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </motion.div>
          ) : searched && results.length > 0 ? (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="font-body text-sm text-muted-foreground mb-6">Found {results.length} verse{results.length !== 1 ? "s" : ""}</p>
              <div className="space-y-4">
                {results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="ornate-border-hover rounded-2xl bg-card/80 overflow-hidden">
                      {/* Decorative top accent */}
                      <div className="h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Verse icon */}
                          <div className="w-10 h-10 rounded-xl bg-olive/10 border border-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-olive/20 group-hover:border-gold/25 transition-all duration-300">
                            <BookOpen className="w-5 h-5 text-olive group-hover:text-gold transition-colors duration-300" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Reference header */}
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-display text-base font-semibold text-olive">{result.reference}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-gold/10 font-body text-[10px] uppercase tracking-wider text-gold/80 border border-gold/15">
                                {result.translation_name}
                              </span>
                            </div>

                            {/* Verse text */}
                            <p className="font-body text-base leading-relaxed text-foreground/85 italic">
                              "{result.text.trim()}"
                            </p>
                          </div>

                          {/* Share button */}
                          <div className="flex-shrink-0">
                            <VerseShareCard
                              verse={result.text.trim()}
                              reference={result.reference}
                              translation={result.translation_name}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Decorative bottom accent */}
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : searched ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <p className="font-display text-xl text-muted-foreground">No verses found</p>
              <p className="mt-2 font-body text-sm text-muted-foreground/70">Try a specific reference like "Genesis 1:1" or "Psalm 23"</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
