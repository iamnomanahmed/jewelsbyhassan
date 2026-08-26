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

    if (reducedMotion.matches) {
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

    const prepare = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
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
    };

    prepare(document);
    const mutations = new MutationObserver((entries) => {
      entries.forEach((entry) => entry.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.matches(SELECTOR)) prepare(node.parentNode ?? document);
          else prepare(node);
        }
      }));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return children;
}

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname} className="route-transition">{children}</div>;
}
