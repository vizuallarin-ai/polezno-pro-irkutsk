"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    let cancelled = false;
    let tickerFn: ((time: number) => void) | null = null;

    const start = () => {
      if (cancelled) return;

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      tickerFn = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    };

    // Defer smooth-scroll init so it does not compete with LCP / hydration.
    const ric = window.requestIdleCallback?.(start, { timeout: 1500 });
    const timeoutId =
      typeof ric === "number" ? undefined : window.setTimeout(start, 1);

    return () => {
      cancelled = true;
      if (typeof ric === "number") window.cancelIdleCallback?.(ric);
      if (timeoutId != null) window.clearTimeout(timeoutId);
      if (tickerFn) gsap.ticker.remove(tickerFn);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
