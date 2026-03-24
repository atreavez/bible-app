import { motion } from "framer-motion";
import { Bookmark, Trash2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { useBookmarks } from "@/hooks/useBookmarks";

export default function Bookmarks() {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-16 px-6 max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bookmark className="w-5 h-5 text-gold" />
            <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Saved Verses
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Your <span className="text-gradient-gold italic">Bookmarks</span>
          </h1>
          <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
            Verses you've saved for reflection and study.
          </p>
        </ScrollReveal>

        {bookmarks.length === 0 ? (
          <ScrollReveal className="text-center py-20">
            <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-display text-xl text-muted-foreground">No bookmarks yet</p>
            <p className="mt-2 font-body text-sm text-muted-foreground/70 max-w-md mx-auto">
              While reading the Bible, tap the bookmark icon next to any verse to save it here.
            </p>
            <Link
              to="/read"
              className="mt-6 inline-flex items-center gap-2 ornate-border-hover px-6 py-3 bg-olive/90 hover:bg-olive text-primary-foreground font-display text-sm tracking-wide rounded-sm transition-all duration-300"
            >
              <BookOpen className="w-4 h-4" />
              Start Reading
            </Link>
          </ScrollReveal>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bm, i) => (
              <motion.div
                key={bm.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                exit={{ opacity: 0, x: -50 }}
                className="ornate-border-hover rounded-sm bg-card/80 backdrop-blur-sm p-6 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-display text-sm font-semibold text-olive">
                      {bm.book} {bm.chapter}:{bm.verse}
                    </p>
                    <p className="mt-2 font-body text-base leading-relaxed text-foreground/85">
                      {bm.text}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="font-body text-xs text-muted-foreground uppercase">
                        {bm.translation}
                      </span>
                      <span className="font-body text-xs text-muted-foreground/50">
                        Saved {new Date(bm.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeBookmark(bm.id)}
                    className="p-2 rounded-sm text-muted-foreground/40 hover:text-destructive transition-colors duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
