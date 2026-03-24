import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, ChevronLeft, ChevronRight, Volume2, VolumeX, Search, Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { bibleBooks, translations, fetchBibleText, type BibleBook } from "@/lib/bibleData";

export default function BibleReader() {
  const [selectedBook, setSelectedBook] = useState<BibleBook>(bibleBooks[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedTranslation, setSelectedTranslation] = useState(translations[0]);
  const [verses, setVerses] = useState<{ verse: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBookList, setShowBookList] = useState(false);
  const { addBookmark, isBookmarked } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [activeTestament, setActiveTestament] = useState<"old" | "new">("old");

  const loadChapter = useCallback(async () => {
    setLoading(true);
    const data = await fetchBibleText(selectedTranslation.id, selectedBook.name, selectedChapter);
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

  const toggleAudio = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const text = verses.map((v) => v.text).join(" ");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const filteredBooks = bibleBooks.filter(
    (b) =>
      b.testament === activeTestament &&
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Read the <span className="text-gradient-gold italic">Word</span>
          </h1>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Book Selection */}
          <div className="lg:w-72 flex-shrink-0">
            <motion.div
              layout
              className="ornate-border rounded-sm bg-card/80 backdrop-blur-sm overflow-hidden"
            >
              {/* Translation selector */}
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
                  className="mt-2 w-full bg-background border border-border rounded-sm px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold/50"
                >
                  {translations.map((t) => (
                    <option key={t.id} value={t.id}>
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
                    className="w-full bg-background border border-border rounded-sm pl-9 pr-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-gold/50"
                  />
                </div>
              </div>

              {/* Testament tabs */}
              <div className="flex border-b border-border">
                {(["old", "new"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTestament(t)}
                    className={`flex-1 py-3 font-display text-sm tracking-wide transition-all duration-300 ${
                      activeTestament === t
                        ? "text-olive border-b-2 border-gold bg-parchment/50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "old" ? "Old Testament" : "New Testament"}
                  </button>
                ))}
              </div>

              {/* Book list */}
              <div className="max-h-80 overflow-y-auto scrollbar-ornate">
                {filteredBooks.map((book) => (
                  <motion.button
                    key={book.name}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 font-body text-sm transition-all duration-200 flex items-center justify-between group ${
                      selectedBook.name === book.name
                        ? "bg-olive/10 text-olive border-l-2 border-gold"
                        : "text-foreground/70 hover:bg-parchment-dark/50 hover:text-foreground border-l-2 border-transparent"
                    }`}
                  >
                    <span>{book.name}</span>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {book.chapters} ch
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Reader */}
          <div className="flex-1 min-w-0">
            {/* Chapter navigation */}
            <div className="ornate-border rounded-sm bg-card/80 backdrop-blur-sm p-4 mb-6 flex items-center justify-between">
              <button
                onClick={handlePrevChapter}
                disabled={selectedChapter <= 1}
                className="p-2 rounded-sm hover:bg-parchment-dark/50 disabled:opacity-30 transition-all duration-300 group"
              >
                <ChevronLeft className="w-5 h-5 text-foreground group-hover:text-olive transition-colors" />
              </button>

              <div className="text-center flex-1">
                <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground">
                  {selectedBook.name}
                </h2>
                <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                  {Array.from({ length: Math.min(selectedBook.chapters, 50) }, (_, i) => i + 1).map(
                    (ch) => (
                      <button
                        key={ch}
                        onClick={() => setSelectedChapter(ch)}
                        className={`w-8 h-8 rounded-sm font-body text-xs transition-all duration-200 ${
                          selectedChapter === ch
                            ? "bg-olive text-primary-foreground shadow-md"
                            : "bg-parchment-dark/40 text-muted-foreground hover:bg-olive/20 hover:text-foreground"
                        }`}
                      >
                        {ch}
                      </button>
                    )
                  )}
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
                className="p-2 rounded-sm hover:bg-parchment-dark/50 disabled:opacity-30 transition-all duration-300 group"
              >
                <ChevronRight className="w-5 h-5 text-foreground group-hover:text-olive transition-colors" />
              </button>
            </div>

            {/* Audio control */}
            <div className="mb-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAudio}
                className={`ornate-border-hover px-5 py-2.5 rounded-sm flex items-center gap-2 font-body text-sm transition-all duration-300 ${
                  isReading
                    ? "bg-olive text-primary-foreground"
                    : "bg-card text-foreground hover:text-olive"
                }`}
              >
                {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isReading ? "Stop Reading" : "Listen"}
              </motion.button>
            </div>

            {/* Verses */}
            <div className="ornate-border rounded-sm bg-card/80 backdrop-blur-sm p-6 md:p-10">
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
                      {verses.map((v, i) => (
                        <motion.p
                          key={v.verse}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.3 }}
                          className="font-body text-base md:text-lg leading-relaxed text-foreground/90 hover:text-foreground transition-colors duration-300 group cursor-default"
                        >
                          <span className="font-display text-sm font-bold text-olive/70 mr-2 align-super group-hover:text-gold transition-colors duration-300">
                            {v.verse}
                          </span>
                          {v.text}
                        </motion.p>
                      ))}
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
