"use client";
import { useEffect, useRef } from "react";

interface Options {
  enabled?: boolean;
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  minRatioToActivate?: number;
  // Viewport anchor used by the scroll/resize fallback to decide active section
  // 0 is top, 1 is bottom. Defaults to 0.5 (center).
  activeAnchorRatio?: number;
  // When provided, prefer this section as soon as it becomes even slightly visible
  preferredId?: string | null;
  onSectionChange: (id: string) => void;
  onSectionVisible?: (id: string) => void;
}

// Observes [data-section] elements and reports the most visible one.
export function useIntersectionObserver({
  enabled = true,
  root = null,
  rootMargin = "-20% 0px -40% 0px",
  threshold = [0, 0.25, 0.5, 0.75, 1],
  minRatioToActivate = 0.2,
  activeAnchorRatio = 0.5,
  preferredId = null,
  onSectionChange,
  onSectionVisible,
}: Options) {
  const rafRef = useRef<number | null>(null);
  const ratiosRef = useRef<Map<string, number>>(new Map());

  const thresholdSerialized = JSON.stringify(threshold);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          // Update latest ratios for changed entries
          for (const e of entries) {
            const id = (e.target as HTMLElement).id;
            ratiosRef.current.set(id, e.intersectionRatio);
          }
          // Pick the id with the largest ratio across all observed sections
          let bestId: string | null = null;
          let bestRatio = -1;
          for (const [id, ratio] of ratiosRef.current) {
            if (ratio > bestRatio) {
              bestId = id;
              bestRatio = ratio;
            }
          }
          // If a preferred section exists and is at least slightly visible, prefer it
          if (preferredId) {
            const el = document.getElementById(preferredId);
            if (el) {
              const vpH = window.innerHeight || 0;
              const r = el.getBoundingClientRect();
              const overlap = Math.max(0, Math.min(r.bottom, vpH) - Math.max(r.top, 0));
              const ratio = r.height > 0 ? overlap / Math.min(vpH, r.height) : 0;
              if (ratio > 0.01) {
                onSectionVisible?.(preferredId);
                onSectionChange(preferredId);
                return;
              }
            }
          }

          if (bestId && bestRatio >= minRatioToActivate) {
            onSectionVisible?.(bestId);
            onSectionChange(bestId);
          }
        });
      },
      { root, rootMargin, threshold }
    );

    const sections = document.querySelectorAll<HTMLElement>("[data-section]");
    // Initialize ratios to 0 so we can compare across all sections immediately
    ratiosRef.current = new Map(Array.from(sections).map((s) => [s.id, 0]));
    sections.forEach((s) => observer.observe(s));

    return () => {
      sections.forEach((s) => observer.unobserve(s));
      ratiosRef.current.clear();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, root, rootMargin, threshold, thresholdSerialized, minRatioToActivate, preferredId, onSectionChange, onSectionVisible]);

  // Fallback: compute active section by viewport center on scroll/resize
  useEffect(() => {
    if (!enabled) return;

    let rafId: number | null = null;
    const compute = () => {
      rafId = null;
      const vpH = window.innerHeight || 0;
      const anchorY = vpH * activeAnchorRatio;
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
      let winnerByAnchor: string | null = null;
      let bestDist = Number.POSITIVE_INFINITY;

      for (const el of nodes) {
        const r = el.getBoundingClientRect();
        const visible = r.bottom > 0 && r.top < vpH;
        if (!visible) continue;

        // Primary rule: prefer the section that contains the anchor line
        const containsAnchor = r.top <= anchorY && r.bottom >= anchorY;
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - anchorY);

        // Mark visible when a decent portion is on screen
        const overlap = Math.max(0, Math.min(r.bottom, vpH) - Math.max(r.top, 0));
        const ratio = r.height > 0 ? overlap / Math.min(vpH, r.height) : 0;
        if (ratio >= minRatioToActivate) {
          onSectionVisible?.(el.id);
        }

        if (containsAnchor) {
          if (dist < bestDist) {
            bestDist = dist;
            winnerByAnchor = el.id;
          }
        } else if (!winnerByAnchor) {
          // Fallback: keep closest to anchor until we find one containing it
          if (dist < bestDist) {
            bestDist = dist;
            winnerByAnchor = el.id;
          }
        }
      }

      // If a preferred section exists and is slightly visible, prefer it
      if (preferredId) {
        const el = document.getElementById(preferredId);
        if (el) {
          const r = el.getBoundingClientRect();
          const vpH = window.innerHeight || 0;
          const overlap = Math.max(0, Math.min(r.bottom, vpH) - Math.max(r.top, 0));
          const ratio = r.height > 0 ? overlap / Math.min(vpH, r.height) : 0;
          if (ratio > 0.01) {
            onSectionChange(preferredId);
            return;
          }
        }
      }

      if (winnerByAnchor) {
        onSectionChange(winnerByAnchor);
      }
    };

    const schedule = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(compute);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Initial compute
    schedule();

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule as any);
      window.removeEventListener('resize', schedule as any);
    };
  }, [enabled, minRatioToActivate, activeAnchorRatio, preferredId, onSectionChange, onSectionVisible]);
}
