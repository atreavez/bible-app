import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Headphones, Sparkles, ArrowRight, Search, Sun, Bookmark, Bot, Trophy, Share2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroImage from "@/assets/hero-bible.jpg";
import Navbar from "@/components/Navbar";
import GsapReveal, { GsapStagger, GsapParallax } from "@/components/GsapReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { bibleStories } from "@/lib/bibleData";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: BookOpen,
    title: "Every Translation",
    description: "Access KJV, WEB, BBE, ASV, Darby, Vulgate and many more — all in one beautiful reading experience.",
  },
  {
    icon: Headphones,
    title: "Audio Reader",
    description: "Listen to scripture with built-in text-to-speech. Read along or close your eyes and receive the Word.",
  },
  {
    icon: Sparkles,
    title: "AI Bible Stories",
    description: "Experience the great stories of the Bible brought to life with AI-powered narration.",
  },
  {
    icon: Search,
    title: "Verse Search",
    description: "Instantly look up any verse by reference across all available translations.",
  },
  {
    icon: Sun,
    title: "Daily Devotional",
    description: "Begin each day with a curated verse, reflection, and prayer to nourish your soul.",
  },
  {
    icon: Bookmark,
    title: "Bookmarks",
    description: "Save your favorite verses and build a personal collection for study and meditation.",
  },
];

export default function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax
      gsap.to(heroImageRef.current, {
        y: 200,
        scale: 1.15,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Hero content fade out on scroll
      gsap.to(heroContentRef.current, {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "30% top",
          end: "80% top",
          scrub: true,
        },
      });

      // Hero content entrance
      const tl = gsap.timeline();
      const els = heroContentRef.current?.children;
      if (els) {
        tl.from(Array.from(els), {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
        });
      }

      // Scroll indicator bounce
      gsap.to(scrollIndicatorRef.current, {
        y: 8,
        duration: 1.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            ref={heroImageRef}
            src={heroImage}
            alt="Ancient Bible with olive branches"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-earth/60 via-earth/40 to-background" />
        </div>

        <div
          ref={heroContentRef}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        >
          <span className="font-body text-sm uppercase tracking-[0.3em] text-gold-light mb-6 block">
            The Living Word
          </span>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-earth-foreground text-shadow-warm leading-tight max-w-4xl">
            Scripture{" "}
            <span className="text-gradient-gold italic font-medium">Illuminated</span>
          </h1>

          <p className="font-body text-lg md:text-xl text-earth-foreground/70 mt-6 max-w-2xl leading-relaxed">
            Explore every verse, every translation, every story — beautifully presented
            with audio narration and AI-powered insights.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/read"
              className="group ornate-border-hover px-8 py-4 bg-olive/90 hover:bg-olive text-primary-foreground font-display text-lg tracking-wide flex items-center gap-3 rounded-xl transition-all duration-500"
            >
              Begin Reading
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/stories"
              className="ornate-border-hover px-8 py-4 bg-earth/40 hover:bg-earth/60 text-earth-foreground font-display text-lg tracking-wide rounded-xl transition-all duration-500"
            >
              Explore Stories
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-gold/40 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
          </div>
        </div>
      </section>

      {/* Daily Verse */}
      <section className="py-24 px-6">
        <GsapReveal className="max-w-3xl mx-auto text-center" direction="scale">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Verse of the Day
          </span>
          <blockquote className="mt-6 font-display text-2xl md:text-4xl font-light text-foreground leading-relaxed italic">
            "For God so loved the world, that he gave his only begotten Son, that whosoever
            believeth in him should not perish, but have everlasting life."
          </blockquote>
          <p className="mt-4 font-body text-muted-foreground">— John 3:16, KJV</p>
        </GsapReveal>
        <OrnamentDivider className="mt-12" />
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gradient-parchment">
        <GsapReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Features
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-light text-foreground">
            A Sacred Experience
          </h2>
        </GsapReveal>

        <GsapStagger className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6" stagger={0.12}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className="ornate-border-hover rounded-2xl p-8 bg-card/80 cursor-default group"
            >
              <div className="w-12 h-12 rounded-xl bg-olive/10 border border-gold/15 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-olive/20 group-hover:border-gold/30">
                <feature.icon className="w-6 h-6 text-olive transition-colors duration-300 group-hover:text-gold" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </GsapStagger>
      </section>

      {/* Bible Stories Preview */}
      <section className="py-24 px-6">
        <GsapReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
            AI-Powered
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-light text-foreground">
            Stories of Faith
          </h2>
          <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
            Dive deep into the greatest stories ever told, enhanced with AI narration.
          </p>
        </GsapReveal>

        <GsapStagger className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.1}>
          {bibleStories.slice(0, 4).map((story) => (
            <Link key={story.id} to="/stories">
              <div className="ornate-border-hover rounded-2xl overflow-hidden bg-card group cursor-pointer">
                <div className="h-32 bg-gradient-earth rounded-t-2xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
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
              </div>
            </Link>
          ))}
        </GsapStagger>

        <GsapReveal className="text-center mt-12" delay={0.3}>
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 font-display text-lg text-olive hover:text-gold transition-colors duration-300 group"
          >
            View All Stories
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </GsapReveal>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-earth py-16 px-6 rounded-t-3xl">
        <div className="max-w-7xl mx-auto text-center">
          <BookOpen className="w-8 h-8 text-gold mx-auto mb-4" />
          <h3 className="font-display text-2xl text-earth-foreground">Scripture</h3>
          <p className="mt-2 font-body text-sm text-earth-foreground/50">
            The Word of God, beautifully presented.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
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
  { to: "/search", label: "Search" },
  { to: "/devotional", label: "Devotional" },
  { to: "/stories", label: "AI Stories" },
  { to: "/bookmarks", label: "Bookmarks" },
];
