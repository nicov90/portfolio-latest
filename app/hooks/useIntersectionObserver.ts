"use client";
import { useEffect, useRef } from "react";

interface Options {
  enabled?: boolean;
  minRatioToActivate?: number;
  // Viewport anchor used to decide the active section. 0 is top, 1 is bottom.
  activeAnchorRatio?: number;
  // When provided, prefer this section as soon as it becomes even slightly visible
  preferredId?: string | null;
  onSectionChange: (id: string) => void;
  // Fires on every transition, both becoming visible AND leaving — entrance animations gated on
  // this should replay each time a section scrolls back into view, not just the first time ever.
  onVisibilityChange?: (id: string, visible: boolean) => void;
}

// Observes [data-section] elements on scroll/resize and reports the most visible one, plus
// visibility enter/exit transitions for each. A single scroll-position-based pass drives both:
// an approach based on the real IntersectionObserver's intersectionRatio was tried first, but
// that ratio is computed against each section's *own* total area — for a section much taller
// than the viewport (e.g. Projects, which bundles several full-height cards under one
// [data-section]), that ratio stays near-zero throughout normal scrolling, so it would rarely
// (if ever) cross an activation threshold. Testing whether a section's box contains a fixed
// viewport anchor line instead is independent of the section's own height.
export function useIntersectionObserver({
  enabled = true,
  minRatioToActivate = 0.2,
  activeAnchorRatio = 0.5,
  preferredId = null,
  onSectionChange,
  onVisibilityChange,
}: Options) {
  const visibleIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    // Start every (re)activation from a clean slate. This ref outlives disable/enable cycles
    // (returning to the intro disables the observer while the consumer resets its own visibility
    // state), so stale entries here would make the first compute() below silently skip the
    // "became visible" notification for sections already on screen — their entrance animations
    // would then never fire until the user scrolled them out and back in. Re-notifying a section
    // the consumer already tracks as visible is harmless (the consumer no-ops on no-change), so
    // resetting is always safe.
    visibleIdsRef.current = new Set();

    let rafId: number | null = null;
    const compute = () => {
      rafId = null;
      const vpH = window.innerHeight || 0;
      const anchorY = vpH * activeAnchorRatio;
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
      // Two separate tiers: any section that genuinely contains the anchor line must win over
      // any section that doesn't, full stop. `dist` (distance from the section's own center to the
      // anchor) is only meaningful as a tie-breaker *within* a tier — comparing it *across* tiers is
      // the bug this used to have: a short section sitting just above the anchor has its center
      // close by, while a very tall section (e.g. Projects, which bundles several full-height cards)
      // has its center far below even while its top has already scrolled past the anchor line, so
      // the tall section would lose to the short one despite correctly containing the anchor.
      let containingWinner: string | null = null;
      let containingBestDist = Number.POSITIVE_INFINITY;
      let fallbackWinner: string | null = null;
      let fallbackBestDist = Number.POSITIVE_INFINITY;

      const stillVisible = new Set<string>();

      for (const el of nodes) {
        const r = el.getBoundingClientRect();
        const visible = r.bottom > 0 && r.top < vpH;

        // Mark visibility enter/exit transitions, gating entrance animations so they replay
        // every time a section scrolls back into view instead of only the first time ever.
        const overlap = visible ? Math.max(0, Math.min(r.bottom, vpH) - Math.max(r.top, 0)) : 0;
        const overlapRatio = visible && r.height > 0 ? overlap / Math.min(vpH, r.height) : 0;
        if (overlapRatio >= minRatioToActivate) {
          stillVisible.add(el.id);
          if (!visibleIdsRef.current.has(el.id)) {
            onVisibilityChange?.(el.id, true);
          }
        }

        if (!visible) continue;

        const containsAnchor = r.top <= anchorY && r.bottom >= anchorY;
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - anchorY);

        if (containsAnchor) {
          if (dist < containingBestDist) {
            containingBestDist = dist;
            containingWinner = el.id;
          }
        } else if (dist < fallbackBestDist) {
          fallbackBestDist = dist;
          fallbackWinner = el.id;
        }
      }

      // Anything that was visible last pass but isn't anymore just left the viewport.
      for (const id of visibleIdsRef.current) {
        if (!stillVisible.has(id)) {
          onVisibilityChange?.(id, false);
        }
      }
      visibleIdsRef.current = stillVisible;

      const winnerByAnchor = containingWinner ?? fallbackWinner;

      // If a preferred section exists and is slightly visible, prefer it
      if (preferredId) {
        const el = document.getElementById(preferredId);
        if (el) {
          const r = el.getBoundingClientRect();
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
    // The very last 'scroll' event fired while a smooth-scroll animation is settling can still
    // read a getBoundingClientRect() that's a frame behind the animation's true final position —
    // enough, for a long programmatic scroll, to compute the wrong winning section and then never
    // get corrected (nothing schedules another compute() once motion actually stops). 'scrollend'
    // fires once the browser confirms the scroll has fully settled, so force one more authoritative
    // recompute at that point.
    window.addEventListener('scrollend', schedule);
    // Initial compute
    schedule();

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule as any);
      window.removeEventListener('resize', schedule as any);
      window.removeEventListener('scrollend', schedule);
    };
  }, [enabled, minRatioToActivate, activeAnchorRatio, preferredId, onSectionChange, onVisibilityChange]);
}
