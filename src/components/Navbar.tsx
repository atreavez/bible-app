import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Menu, X, Moon, Sun, Bot, Trophy } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/read", label: "Read" },
  { to: "/chat", label: "AI Study" },
  { to: "/search", label: "Search" },
  { to: "/devotional", label: "Devotional" },
  { to: "/stories", label: "Stories" },
  { to: "/bookmarks", label: "Bookmarks" },
  { to: "/progress", label: "Progress" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggle: toggleDark } = useDarkMode();

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-earth border-b border-gold/15"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-olive/20 border border-gold/20 flex items-center justify-center transition-all duration-300 group-hover:border-gold/40 group-hover:bg-olive/30">
            <BookOpen className="w-4 h-4 text-gold transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="font-display text-xl font-semibold text-earth-foreground tracking-wide">
            Scripture
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 bg-earth/30 rounded-xl px-2 py-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-3.5 py-1.5 font-body text-sm rounded-lg transition-all duration-300 ${
                location.pathname === link.to
                  ? "bg-olive/30 text-gold"
                  : "text-earth-foreground/70 hover:text-gold hover:bg-earth/30"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Dark mode toggle + Mobile toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="w-9 h-9 rounded-lg bg-earth/30 border border-gold/10 flex items-center justify-center text-earth-foreground/80 hover:text-gold transition-all duration-300"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 rounded-lg bg-earth/30 border border-gold/10 flex items-center justify-center text-earth-foreground/80 hover:text-gold transition-colors"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-earth border-t border-gold/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`font-body text-sm py-2.5 px-3 rounded-lg transition-all ${
                    location.pathname === link.to
                      ? "text-gold bg-olive/20"
                      : "text-earth-foreground/80 hover:text-gold hover:bg-earth/20"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
