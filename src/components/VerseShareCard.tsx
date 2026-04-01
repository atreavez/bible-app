import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, X, Copy, Check } from "lucide-react";
import html2canvas from "html2canvas";

interface VerseShareCardProps {
  verse: string;
  reference: string;
  translation: string;
}

const THEMES = [
  { id: "gold", bg: "bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900", text: "text-amber-50" },
  { id: "olive", bg: "bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900", text: "text-emerald-50" },
  { id: "night", bg: "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800", text: "text-slate-100" },
  { id: "parchment", bg: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100", text: "text-amber-900" },
];

export default function VerseShareCard({ verse, reference, translation }: VerseShareCardProps) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(THEMES[0]);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(`"${verse}" — ${reference} (${translation})`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [verse, reference, translation]);

  const shareNative = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: reference,
          text: `"${verse}" — ${reference} (${translation})`,
        });
      } else {
        copyText();
      }
    } catch {
      // Permission denied or user cancelled — fall back to copy
      copyText();
    }
  }, [verse, reference, translation, copyText]);

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `${reference.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [reference]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg hover:bg-gold/10 text-muted-foreground/40 hover:text-gold transition-all duration-300"
        title="Share verse"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {createPortal(<AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card Preview */}
              <div
                ref={cardRef}
                className={`${theme.bg} ${theme.text} rounded-2xl p-8 mb-4 relative overflow-hidden`}
              >
                <div className="absolute top-4 right-4 opacity-10 text-6xl font-display">"</div>
                <p className="font-display text-lg md:text-xl leading-relaxed italic relative z-10">
                  "{verse}"
                </p>
                <div className="mt-6 flex items-center justify-between relative z-10">
                  <span className="font-body text-sm opacity-80">{reference}</span>
                  <span className="font-body text-xs opacity-60">{translation}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
              </div>

              {/* Theme selector */}
              <div className="flex gap-2 justify-center mb-4">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className={`w-8 h-8 rounded-full ${t.bg} border-2 transition-all ${
                      theme.id === t.id ? "border-gold scale-110" : "border-transparent"
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={copyText}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card font-body text-sm text-foreground hover:bg-card/80 transition-all ornate-border"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadCard}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card font-body text-sm text-foreground hover:bg-card/80 transition-all ornate-border disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? "Saving..." : "Download"}
                </button>
                <button
                  onClick={shareNative}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-olive text-primary-foreground font-body text-sm hover:bg-olive/90 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/20 flex items-center justify-center text-background hover:bg-foreground/30 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </>
  );
}





