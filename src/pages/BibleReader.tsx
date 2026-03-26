import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import Navbar from "@/components/Navbar";
import GsapReveal from "@/components/GsapReveal";
import NarrationControls from "@/components/NarrationControls";
import { useNarration } from "@/hooks/useNarration";
import OrnamentDivider from "@/components/OrnamentDivider";
import {
  bibleBooks,
  translations,
  fetchBibleText,
  type BibleBook,
} from "@/lib/bibleData";

export default function BibleReader() {
const narration = useNarration();
const [selectedBook, setSelectedBook] = useState<BibleBook>(bibleBooks[0]);
const [selectedChapter, setSelectedChapter] = useState(1);
const [selectedTranslation, setSelectedTranslation] = useState(translations[0]);
const [verses, setVerses] = useState<{ verse: number; text: string }[]>([]);
const [loading, setLoading] = useState(false);
const { addBookmark, isBookmarked } = useBookmarks();
const [searchQuery, setSearchQuery] = useState("");
const [activeTestament, setActiveTestament] = useState<"old" | "new">("old");

const loadChapter = useCallback(async () => {
  setLoading(true);
  const data = await fetchBibleText(
    selectedTranslation.id,
    selectedBook.name,
    selectedChapter,
  );
  setVerses(data.verses);
  setLoading(false);
}, [selectedBook, selectedChapter, selectedTranslation]);

useEffect(() => {
  loadChapter();
}, [loadChapter]);

const handlePrevChapter = () => {
  if (selectedChapter > 1) setSelectedChapter((c) => c - 1);
};
const handleNextChapter = () => {
  if (selectedChapter < selectedBook.chapters) setSelectedChapter((c) => c + 1);
};

const filteredBooks = bibleBooks.filter(
  (b) =>
    b.testament === activeTestament &&
    b.name.toLowerCase().includes(searchQuery.toLowerCase()),
);

return (
  <div className="min-h-screen bg-background scrollbar-ornate">
    <Navbar />

    <div className="pt-20 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
      <GsapReveal className="text-center mb-8" direction="scale">
        <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
          Read the <span className="text-gradient-gold italic">Word</span>
        </h1>
      </GsapReveal>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="ornate-border rounded-2xl bg-card/80 overflow-hidden">
            {/* Translation */}
            <div className="p-4 border-b border-border">
              <label className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                Translation
              </label>
              <select
                value={selectedTranslation.id}
                onChange={(e) => {
                  const t = translations.find((t) => t.id === e.target.value);
                  if (t) setSelectedTranslation(t);
                }}
                className="mt-2 w-full bg-background border border-border rounded-xl px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                {translations.map((t) => (
                  <option key={t.id + t.abbreviation} value={t.id}>
                    {t.abbreviation} — {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </div>

            {/* Testament tabs */}
            <div className="flex border-b border-border p-1.5 gap-1">
              {(["old", "new"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTestament(t)}
                  className={`flex-1 py-2.5 font-display text-sm tracking-wide rounded-lg transition-all duration-300 ${
                    activeTestament === t
                      ? "text-olive bg-olive/10 border border-gold/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-parchment-dark/30"
                  }`}
                >
                  {t === "old" ? "Old Testament" : "New Testament"}
                </button>
              ))}
            </div>

            {/* Books */}
            <div className="max-h-80 overflow-y-auto scrollbar-ornate">
              {filteredBooks.map((book) => (
                <button
                  key={book.name}
                  onClick={() => {
                    setSelectedBook(book);
                    setSelectedChapter(1);
                  }}
                  className={`w-full text-left px-4 py-2.5 font-body text-sm transition-all duration-200 flex items-center justify-between group ${
                    selectedBook.name === book.name
                      ? "bg-olive/10 text-olive border-l-3 border-gold"
                      : "text-foreground/70 hover:bg-parchment-dark/30 hover:text-foreground border-l-3 border-transparent"
                  }`}
                >
                  <span>{book.name}</span>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {book.chapters} ch
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Reader */}
        <div className="flex-1 min-w-0">
          {/* Chapter navigation */}
          <div className="ornate-border rounded-2xl bg-card/80 p-4 mb-6 flex items-center justify-between">
            <button
              onClick={handlePrevChapter}
              disabled={selectedChapter <= 1}
              className="p-2.5 rounded-xl hover:bg-parchment-dark/50 disabled:opacity-30 transition-all duration-300 group"
            >
              <ChevronLeft className="w-5 h-5 text-foreground group-hover:text-olive transition-colors" />
            </button>

            <div className="text-center flex-1">
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground">
                {selectedBook.name}
              </h2>
              <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                {Array.from(
                  { length: Math.min(selectedBook.chapters, 50) },
                  (_, i) => i + 1,
                ).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setSelectedChapter(ch)}
                    className={`w-8 h-8 rounded-lg font-body text-xs transition-all duration-200 ${
                      selectedChapter === ch
                        ? "bg-olive text-primary-foreground shadow-md"
                        : "bg-parchment-dark/30 text-muted-foreground hover:bg-olive/20 hover:text-foreground"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
                {selectedBook.chapters > 50 && (
                  <span className="text-xs text-muted-foreground">
                    +{selectedBook.chapters - 50} more
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleNextChapter}
              disabled={selectedChapter >= selectedBook.chapters}
              className="p-2.5 rounded-xl hover:bg-parchment-dark/50 disabled:opacity-30 transition-all duration-300 group"
            >
              <ChevronRight className="w-5 h-5 text-foreground group-hover:text-olive transition-colors" />
            </button>
          </div>

          {/* Audio Controls */}
          <div className="mb-6 flex justify-end">
            <NarrationControls
              getText={() => verses.map((v) => v.text).join(" ")}
              narration={narration}
            />
          </div>

          {/* Verses */}
          <div className="ornate-border rounded-2xl bg-card/80 p-6 md:p-10">
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
              ) : (
                <motion.div
                  key={`${selectedBook.name}-${selectedChapter}-${selectedTranslation.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="font-display text-lg text-muted-foreground mb-6 text-center">
                    {selectedBook.name} Chapter {selectedChapter} ·{" "}
                    {selectedTranslation.abbreviation}
                  </h3>
                  <div className="space-y-4">
                    {verses.map((v, i) => {
                      const bookmarked = isBookmarked(
                        selectedBook.name,
                        selectedChapter,
                        v.verse,
                        selectedTranslation.id,
                      );
                      return (
                        <motion.div
                          key={v.verse}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.3 }}
                          className="flex items-start gap-2 group cursor-default hover:bg-parchment/30 rounded-xl px-3 py-2 -mx-3 transition-colors duration-300"
                        >
                          <p className="flex-1 font-body text-base md:text-lg leading-relaxed text-foreground/90 hover:text-foreground transition-colors duration-300">
                            <span className="font-display text-sm font-bold text-olive/70 mr-2 align-super group-hover:text-gold transition-colors duration-300">
                              {v.verse}
                            </span>
                            {v.text}
                          </p>
                          <button
                            onClick={() =>
                              addBookmark({
                                book: selectedBook.name,
                                chapter: selectedChapter,
                                verse: v.verse,
                                text: v.text,
                                translation: selectedTranslation.id,
                              })
                            }
                            className={`mt-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 rounded-lg hover:bg-gold/10 ${
                              bookmarked
                                ? "!opacity-100 text-gold"
                                : "text-muted-foreground/40 hover:text-gold"
                            }`}
                          >
                            {bookmarked ? (
                              <BookmarkCheck className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <OrnamentDivider />
        </div>
      </div>
    </div>
  </div>
);
}
