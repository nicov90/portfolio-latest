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
export const MOBILE_ANIMATIONS = {
  master: false,

  backgroundDrift: false,      // DynamicBackground: circles' continuous drift motion
  backgroundParallax: false,   // DynamicBackground: fixed layer's scroll-linked translateY
  backgroundColorFade: false,  // DynamicBackground: circle color/opacity crossfade on section change
  stars: false,                // StarsBackground sparkle animation

  sectionReveal: false,        // AppClient: per-section scroll-triggered fade/slide-in
  cardEntrances: false,        // whileInView fade-ups on individual cards (Experience, Certifications, Projects, WhatIBring, AboutMe)
  textEntrances: false,        // IntroScreen, StaggeredText, RotatingGreeting, AnimatedText, LocalizedFade

  carousel: false,             // Project image carousels' slide/fade transitions
  clickRipple: false,          // Layout: click ripple effect
  navDrawer: false,            // Layout: mobile nav drawer slide
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
