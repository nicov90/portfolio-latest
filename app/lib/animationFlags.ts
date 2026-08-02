"use client";
import { useIsTabletOrBelow } from '../hooks/useIsTabletOrBelow';

// Bisection switchboard for the real-device (S24 Ultra + tablet) scroll-tearing investigation.
// Desktop is never affected by any of this — every flag here only applies below TABLET_BREAKPOINT
// (see useIsTabletOrBelow). Start everything OFF (fully static page, nothing animates) to confirm
// the artifact disappears entirely, then flip categories back on ONE AT A TIME and re-test on a
// real device after each to find which category is actually responsible.
//
// `master: true` is an escape hatch that makes tablet/mobile behave exactly like desktop again
// (ignores every per-category flag below) — flip this instead of hand-restoring every flag once
// the investigation concludes.
// Round 2: with EVERYTHING off, the artifact was confirmed gone on real hardware (S24 Ultra +
// tablet). Re-enabling now, safest first — categories below are event-triggered or fire-once
// (a tap, a language switch, a section transition), never continuously re-running while the user
// is mid-scroll, so they're the least likely to be the actual cause:
// - textEntrances: only runs on a language switch or the one-time intro typewriter — nothing to
//   do with scrolling at all.
// - clickRipple: only spawns on an explicit tap, self-removes after 1.2s, never touches scroll.
// - navDrawer: only animates when the FAB/drawer is explicitly opened/closed — closed (not
//   rendered) during ordinary scrolling.
// - backgroundColorFade: a single 0.8s crossfade when the active section changes, not re-run on
//   every scroll frame the way the drift/parallax were.
// Still OFF: backgroundDrift, backgroundParallax, stars, sectionReveal, cardEntrances, carousel,
// microInteractions — these are the ones that either run continuously in the background or are
// literally driven by the scroll position/IntersectionObserver, so they stay off until the safer
// batch above is confirmed clean on-device.
export const MOBILE_ANIMATIONS = {
  master: false,

  backgroundDrift: false,      // DynamicBackground: circles' continuous drift motion
  backgroundParallax: false,   // DynamicBackground: fixed layer's scroll-linked translateY
  backgroundColorFade: true,   // DynamicBackground: circle color/opacity crossfade on section change
  stars: false,                // StarsBackground sparkle animation

  sectionReveal: false,        // AppClient: per-section scroll-triggered fade/slide-in
  cardEntrances: false,        // whileInView fade-ups on individual cards (Experience, Certifications, Projects, WhatIBring, AboutMe)
  textEntrances: true,         // IntroScreen, StaggeredText, RotatingGreeting, AnimatedText, LocalizedFade

  carousel: false,             // Project image carousels' slide/fade transitions
  clickRipple: true,           // Layout: click ripple effect
  navDrawer: true,             // Layout: mobile nav drawer slide
  microInteractions: false,    // hover/tap scales, pulsing dots, small icon animations, lightbox, language selector, scroll progress bar
} as const;

export type AnimationCategory = keyof typeof MOBILE_ANIMATIONS;

// Returns whether a given animation category should actually run right now. Desktop (>= tablet
// breakpoint) always returns true — none of this touches desktop behavior.
export function useAnimEnabled(category: AnimationCategory): boolean {
  const isTabletOrBelow = useIsTabletOrBelow();
  if (!isTabletOrBelow) return true;
  return MOBILE_ANIMATIONS.master || MOBILE_ANIMATIONS[category];
}
