import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { BookOpen, Clock, Heart, Target, ChevronRight, Sparkles } from "lucide-react";

interface OnboardingAnswers {
  frequency: string;
  preferredTime: string;
  focus: string;
  experience: string;
}

const ONBOARDING_KEY = "scripture-onboarded";

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setNeedsOnboarding(true);
  }, []);

  const completeOnboarding = useCallback((answers: OnboardingAnswers) => {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(answers));
    setNeedsOnboarding(false);
  }, []);

  return { needsOnboarding, completeOnboarding };
}

interface OnboardingProps {
  onComplete: (answers: OnboardingAnswers) => void;
}

const steps = [
  {
    id: "welcome",
    icon: BookOpen,
    title: "Welcome to Scripture",
    subtitle: "Let's personalize your experience",
    description: "Answer a few quick questions so we can tailor your Bible reading journey.",
  },
  {
    id: "frequency",
    icon: Clock,
    title: "How often do you read the Bible?",
    subtitle: "Your reading rhythm",
    options: [
      { value: "daily", label: "Every Day", emoji: "📖", desc: "Consistent daily reader" },
      { value: "weekly", label: "A Few Times a Week", emoji: "📅", desc: "Regular weekly practice" },
      { value: "monthly", label: "Occasionally", emoji: "🌙", desc: "When inspiration strikes" },
      { value: "new", label: "Just Starting Out", emoji: "🌱", desc: "Beginning my journey" },
    ],
  },
  {
    id: "time",
    icon: Clock,
    title: "When do you prefer to read?",
    subtitle: "Your quiet time",
    options: [
      { value: "morning", label: "Morning", emoji: "🌅", desc: "Start the day with God" },
      { value: "afternoon", label: "Afternoon", emoji: "☀️", desc: "Midday meditation" },
      { value: "evening", label: "Evening", emoji: "🌆", desc: "Wind down with the Word" },
      { value: "anytime", label: "Anytime", emoji: "⏰", desc: "Flexible schedule" },
    ],
  },
  {
    id: "focus",
    icon: Heart,
    title: "What draws you to the Bible?",
    subtitle: "Your spiritual focus",
    options: [
      { value: "comfort", label: "Comfort & Peace", emoji: "🕊️", desc: "Finding rest for my soul" },
      { value: "wisdom", label: "Wisdom & Guidance", emoji: "💡", desc: "Life direction and insight" },
      { value: "stories", label: "Stories & History", emoji: "📜", desc: "The narrative of God's people" },
      { value: "growth", label: "Spiritual Growth", emoji: "🌿", desc: "Deepening my faith" },
    ],
  },
  {
    id: "experience",
    icon: Target,
    title: "How familiar are you with the Bible?",
    subtitle: "Your knowledge level",
    options: [
      { value: "beginner", label: "Beginner", emoji: "🌱", desc: "Just getting started" },
      { value: "intermediate", label: "Intermediate", emoji: "📗", desc: "Know the basics well" },
      { value: "advanced", label: "Advanced", emoji: "📚", desc: "Deep knowledge" },
      { value: "scholar", label: "Scholar", emoji: "🎓", desc: "Academic level study" },
    ],
  },
];

export default function OnboardingQuestionnaire({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isWelcome = step.id === "welcome";
  const totalQuestions = steps.length - 1;
  const questionIndex = currentStep - 1;

  // Animate step transitions
  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.4)" }
      );

      // Stagger options
      const options = cardRef.current?.querySelectorAll(".onboard-option");
      if (options?.length) {
        gsap.fromTo(
          options,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.3 }
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, [currentStep]);

  // Progress bar animation
  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${((currentStep) / (steps.length - 1)) * 100}%`,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, [currentStep]);

  const selectOption = (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    // Animate selection feedback
    gsap.to(cardRef.current, {
      scale: 1.02,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    });

    // Auto advance after delay
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        // Exit animation
        gsap.to(cardRef.current, {
          opacity: 0,
          x: -60,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => setCurrentStep((s) => s + 1),
        });
      } else {
        // Final step complete
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.05,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => onComplete(newAnswers as OnboardingAnswers),
        });
      }
    }, 400);
  };

  const handleWelcomeNext = () => {
    gsap.to(cardRef.current, {
      opacity: 0,
      y: -30,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setCurrentStep(1),
    });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[90] flex items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg, hsl(30 25% 18%) 0%, hsl(100 25% 15%) 50%, hsl(30 25% 18%) 100%)" }}
    >
      {/* Ambient particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-gold/20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Progress bar */}
      {!isWelcome && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-1.5 bg-earth/40 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
            style={{ width: "0%" }}
          />
        </div>
      )}

      {/* Step counter */}
      {!isWelcome && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2">
          <span className="font-body text-xs text-gold-light/50 tracking-widest uppercase">
            {questionIndex + 1} of {totalQuestions}
          </span>
        </div>
      )}

      {/* Card */}
      <div ref={cardRef} className="w-full max-w-lg">
        {isWelcome ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-olive/30 border border-gold/30 flex items-center justify-center mx-auto mb-8 animate-pulse-gold">
              <BookOpen className="w-10 h-10 text-gold" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-light text-earth-foreground text-shadow-warm">
              {step.title}
            </h1>
            <p className="mt-3 font-body text-gold-light/60 tracking-wide">
              {step.subtitle}
            </p>
            <p className="mt-6 font-body text-earth-foreground/50 max-w-sm mx-auto leading-relaxed">
              {step.description}
            </p>
            <button
              onClick={handleWelcomeNext}
              className="mt-10 px-8 py-4 bg-olive/80 hover:bg-olive text-primary-foreground font-display text-lg tracking-wide rounded-xl border border-gold/20 flex items-center gap-3 mx-auto transition-all duration-300 hover:shadow-lg hover:shadow-gold/10 group"
            >
              Let's Begin
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <div>
            {/* Question header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-olive/30 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-gold" />
              </div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-gold-light/50 mb-2">
                {step.subtitle}
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-light text-earth-foreground">
                {step.title}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {step.options?.map((option) => {
                const key = step.id as keyof OnboardingAnswers;
                const isSelected = answers[key] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => selectOption(step.id, option.value)}
                    className={`onboard-option w-full text-left px-6 py-5 rounded-xl border transition-all duration-300 flex items-center gap-4 group ${
                      isSelected
                        ? "bg-olive/30 border-gold/50 shadow-lg shadow-gold/10"
                        : "bg-earth/30 border-gold/10 hover:border-gold/30 hover:bg-earth/50"
                    }`}
                  >
                    <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                      {option.emoji}
                    </span>
                    <div className="flex-1">
                      <span className="font-display text-lg text-earth-foreground block">
                        {option.label}
                      </span>
                      <span className="font-body text-xs text-earth-foreground/40">
                        {option.desc}
                      </span>
                    </div>
                    {isSelected && <Sparkles className="w-5 h-5 text-gold" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
