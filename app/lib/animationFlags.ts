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
// Round 2 result: enabling {textEntrances, clickRipple, navDrawer, backgroundColorFade} together
// brought the artifact BACK on real hardware. That's surprising for three of the four (none of
// them touch scroll — a tap-triggered ripple, a closed drawer, a language-switch fade), which
// makes backgroundColorFade the prime suspect of the batch: unlike the other three, it animates
// the `background` CSS property (a gradient string) on DynamicBackground's three huge, permanently
// blurred, fixed full-viewport layers. Animating `background` — as opposed to transform/opacity —
// is NOT compositor-only, it forces a real repaint of that entire layer on every tick of its 0.8s
// crossfade, and that crossfade fires exactly when the active section changes, which is to say
// almost always while the user is mid-scroll (that's how you reach a new section). Isolating it
// alone this round to confirm before touching anything else.
export const MOBILE_ANIMATIONS = {
  master: false,

  backgroundDrift: true,      // DynamicBackground: circles' continuous drift motion
  backgroundParallax: true,   // DynamicBackground: fixed layer's scroll-linked translateY
  backgroundColorFade: false,   // DynamicBackground: circle color/opacity crossfade on section change — PRIME SUSPECT, isolating this round
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
