import { Bookmark, Trash2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import GsapReveal from "@/components/GsapReveal";
import { useBookmarks } from "@/hooks/useBookmarks";

export default function Bookmarks() {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />
      <div className="pt-20 pb-16 px-6 max-w-4xl mx-auto">
        <GsapReveal className="text-center mb-12" direction="scale">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-olive/10 border border-gold/15 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-gold" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Your <span className="text-gradient-gold italic">Bookmarks</span>
          </h1>
          <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
            Verses you've saved for reflection and study.
          </p>
        </GsapReveal>

        {bookmarks.length === 0 ? (
          <GsapReveal className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="font-display text-xl text-muted-foreground">No bookmarks yet</p>
            <p className="mt-2 font-body text-sm text-muted-foreground/70 max-w-md mx-auto">
              While reading, tap the bookmark icon next to any verse to save it.
            </p>
            <Link
              to="/read"
              className="mt-6 inline-flex items-center gap-2 ornate-border-hover px-6 py-3 bg-olive/90 hover:bg-olive text-primary-foreground font-display text-sm tracking-wide rounded-xl transition-all duration-300"
            >
              <BookOpen className="w-4 h-4" />
              Start Reading
            </Link>
          </GsapReveal>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm, i) => (
              <motion.div
                key={bm.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="ornate-border-hover rounded-2xl bg-card/80 p-6 group"
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
                      <span className="font-body text-xs text-muted-foreground uppercase px-2 py-0.5 bg-muted rounded-md">
                        {bm.translation}
                      </span>
                      <span className="font-body text-xs text-muted-foreground/50">
                        Saved {new Date(bm.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBookmark(bm.id)}
                    className="p-2 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
