"use client";
import { useIsTabletOrBelow } from '../hooks/useIsTabletOrBelow';

// Bisection switchboard used to track down a real-device (S24 Ultra + tablet) scroll-tearing
// artifact. Desktop was never affected by any of this — every flag here only applies below
// TABLET_BREAKPOINT (see useIsTabletOrBelow).
//
// RESOLVED: root cause was `backgroundColorFade` — DynamicBackground used to animate the
// `background` CSS property (a gradient string) directly on its three huge, permanently-blurred,
// fixed full-viewport circles when the active section changed. Interpolating `background` isn't
// compositor-only like transform/opacity: it forces a real repaint of that whole layer on every
// tick of the 0.8s crossfade, and that crossfade fires almost always while the user is mid-scroll
// (that's how a new section is reached). Confirmed by isolating every other category (all ON) with
// only backgroundColorFade OFF — artifact gone; then only backgroundColorFade ON — artifact back.
// Fixed at the source in DynamicBackground.tsx's `Circle`: the crossfade is now two stacked layers
// each holding ONE fixed (never-animated) gradient, cross-fading via `opacity` only. Everything is
// back on below, including backgroundColorFade with its new, cheap implementation.
//
// `master: true` is an escape hatch that makes tablet/mobile behave exactly like desktop again
// (ignores every per-category flag below) — kept for convenience even now that everything is on.
// If a similar artifact ever resurfaces, flip everything back to `false` and re-bisect the same
// way: one category at a time, re-test on a real device after each.
export const MOBILE_ANIMATIONS = {
  master: false,

  backgroundDrift: true,      // DynamicBackground: circles' continuous drift motion
  backgroundParallax: true,   // DynamicBackground: fixed layer's scroll-linked translateY
  backgroundColorFade: true,  // DynamicBackground: circle color crossfade on section change (now opacity-only, see resolution note above)
  stars: true,                // StarsBackground sparkle animation

  sectionReveal: true,        // AppClient: per-section scroll-triggered fade/slide-in
  cardEntrances: true,        // whileInView fade-ups on individual cards (Experience, Certifications, Projects, WhatIBring, AboutMe)
  textEntrances: true,        // IntroScreen, StaggeredText, RotatingGreeting, AnimatedText, LocalizedFade

  carousel: true,             // Project image carousels' slide/fade transitions
  clickRipple: true,          // Layout: click ripple effect
  navDrawer: true,            // Layout: mobile nav drawer slide
  microInteractions: true,    // hover/tap scales, pulsing dots, small icon animations, lightbox, language selector, scroll progress bar
} as const;

export type AnimationCategory = keyof typeof MOBILE_ANIMATIONS;

// Returns whether a given animation category should actually run right now. Desktop (>= tablet
// breakpoint) always returns true — none of this touches desktop behavior.
export function useAnimEnabled(category: AnimationCategory): boolean {
  const isTabletOrBelow = useIsTabletOrBelow();
  if (!isTabletOrBelow) return true;
  return MOBILE_ANIMATIONS.master || MOBILE_ANIMATIONS[category];
}
