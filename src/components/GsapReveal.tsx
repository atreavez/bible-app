import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GsapRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  duration?: number;
  stagger?: number;
  as?: "div" | "section";
}

export default function GsapReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.9,
  as: Tag = "div",
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const from: gsap.TweenVars = { opacity: 0, duration, delay, ease: "power3.out" };
    
    switch (direction) {
      case "up": from.y = 50; break;
      case "left": from.x = -60; break;
      case "right": from.x = 60; break;
      case "scale": from.scale = 0.88; break;
    }

    const tween = gsap.from(el, {
      ...from,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        end: "bottom 20%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [delay, direction, duration]);

  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}

// Stagger children utility
export function GsapStagger({
  children,
  className = "",
  stagger = 0.1,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = el.children;
    if (!items.length) return;

    const from: gsap.TweenVars = { opacity: 0, duration: 0.8, stagger, ease: "power3.out" };
    switch (direction) {
      case "up": from.y = 40; break;
      case "left": from.x = -40; break;
      case "right": from.x = 40; break;
      case "scale": from.scale = 0.9; break;
    }

    const tween = gsap.from(items, {
      ...from,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [stagger, direction]);

  return <div ref={ref} className={className}>{children}</div>;
}

// Parallax effect
export function GsapParallax({
  children,
  className = "",
  speed = 0.3,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tween = gsap.to(el, {
      y: () => -speed * 200,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [speed]);

  return <div ref={ref} className={className}>{children}</div>;
}
