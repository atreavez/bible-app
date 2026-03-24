import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Headphones, Sparkles, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-bible.jpg";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { bibleStories } from "@/lib/bibleData";

const features = [
  {
    icon: BookOpen,
    title: "Every Translation",
    description: "Access KJV, WEB, BBE, ASV and more — all in one beautiful reading experience.",
  },
  {
    icon: Headphones,
    title: "Audio Reader",
    description: "Listen to scripture with built-in text-to-speech. Read along or close your eyes.",
  },
  {
    icon: Sparkles,
    title: "AI Bible Stories",
    description: "Experience the great stories of the Bible brought to life with AI-powered narration.",
  },
];

export default function Index() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <img
            src={heroImage}
            alt="Ancient Bible with olive branches"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-earth/60 via-earth/40 to-background" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <span className="font-body text-sm uppercase tracking-[0.3em] text-gold-light mb-6 block">
              The Living Word
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-earth-foreground text-shadow-warm leading-tight max-w-4xl"
          >
            Scripture{" "}
            <span className="text-gradient-gold italic font-medium">Illuminated</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="font-body text-lg md:text-xl text-earth-foreground/70 mt-6 max-w-2xl leading-relaxed"
          >
            Explore every verse, every translation, every story — beautifully presented
            with audio narration and AI-powered insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/read"
              className="group ornate-border-hover px-8 py-4 bg-olive/90 hover:bg-olive text-primary-foreground font-display text-lg tracking-wide flex items-center gap-3 rounded-sm transition-all duration-500"
            >
              Begin Reading
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/stories"
              className="ornate-border-hover px-8 py-4 bg-earth/40 hover:bg-earth/60 text-earth-foreground font-display text-lg tracking-wide rounded-sm transition-all duration-500"
            >
              Explore Stories
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-gold/40 flex items-start justify-center p-1.5"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* Daily Verse */}
      <section className="py-24 px-6">
        <ScrollReveal className="max-w-3xl mx-auto text-center">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Verse of the Day
          </span>
          <blockquote className="mt-6 font-display text-2xl md:text-4xl font-light text-foreground leading-relaxed italic">
            "For God so loved the world, that he gave his only begotten Son, that whosoever
            believeth in him should not perish, but have everlasting life."
          </blockquote>
          <p className="mt-4 font-body text-muted-foreground">— John 3:16, KJV</p>
        </ScrollReveal>
        <OrnamentDivider className="mt-12" />
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gradient-parchment">
        <ScrollReveal className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Features
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-light text-foreground">
              A Sacred Experience
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.15}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="ornate-border-hover rounded-sm p-8 bg-card/80 backdrop-blur-sm cursor-default group"
              >
                <feature.icon className="w-8 h-8 text-olive transition-colors duration-300 group-hover:text-gold" />
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Bible Stories Preview */}
      <section className="py-24 px-6">
        <ScrollReveal className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
              AI-Powered
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-light text-foreground">
              Stories of Faith
            </h2>
            <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
              Dive deep into the greatest stories ever told, enhanced with AI narration.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bibleStories.slice(0, 4).map((story, i) => (
            <ScrollReveal key={story.id} delay={i * 0.1}>
              <Link to="/stories">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="ornate-border-hover rounded-sm overflow-hidden bg-card group cursor-pointer"
                >
                  <div className="h-32 bg-gradient-earth flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                    {story.image}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-olive transition-colors">
                      {story.title}
                    </h3>
                    <p className="mt-1 font-body text-xs text-muted-foreground">
                      {story.book} {story.chapter}
                    </p>
                    <p className="mt-2 font-body text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {story.description}
                    </p>
                  </div>
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3} className="text-center mt-12">
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 font-display text-lg text-olive hover:text-gold transition-colors duration-300 group"
          >
            View All Stories
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-earth py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <BookOpen className="w-8 h-8 text-gold mx-auto mb-4" />
          <h3 className="font-display text-2xl text-earth-foreground">Scripture</h3>
          <p className="mt-2 font-body text-sm text-earth-foreground/50">
            The Word of God, beautifully presented.
          </p>
          <div className="mt-8 flex justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body text-sm text-earth-foreground/60 hover:text-gold transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mt-8 font-body text-xs text-earth-foreground/30">
            © {new Date().getFullYear()} Scripture. All glory to God.
          </p>
        </div>
      </footer>
    </div>
  );
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/read", label: "Read Bible" },
  { to: "/stories", label: "AI Stories" },
];
