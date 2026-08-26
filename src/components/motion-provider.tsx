"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, type ReactNode } from "react";

const SELECTOR = "[data-reveal]";

export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    root.classList.add("motion-enabled");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const lowPowerMobile = window.matchMedia("(max-width: 767px)").matches && navigator.hardwareConcurrency <= 4;

    if (reducedMotion.matches || connection?.saveData || lowPowerMobile) {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
        element.dataset.revealState = "visible";
      });
      return;
    }

    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        element.dataset.revealState = "visible";
        observer.unobserve(element);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    document.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
      if (observed.has(element)) return;
      observed.add(element);
      if (element.dataset.reveal === "stagger") {
        Array.from(element.children).forEach((child, index) => {
          (child as HTMLElement).style.setProperty("--reveal-order", String(Math.min(index, 7)));
        });
      }
      element.dataset.revealState = "hidden";
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return children;
}
