"use client";
import { motion } from 'motion/react';
import React, { useMemo } from 'react';
import { useIsMobile } from './ui/use-mobile';

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  peakOpacity: number;
}

const MIN_DISTANCE = 7; // percentage-space units; keeps stars from clumping together
const MAX_ATTEMPTS = 25;

// Four-point sparkle silhouette (concave curves between points) — reads as an actual star shape
// even at small sizes, unlike a plain diamond.
const SPARKLE_PATH = 'M12 0C12 6.6 6.6 12 0 12C6.6 12 12 17.4 12 24C12 17.4 17.4 12 24 12C17.4 12 12 6.6 12 0Z';

function generateStars(count: number): Star[] {
  const stars: Star[] = [];

  for (let id = 0; id < count; id++) {
    let top = 0;
    let left = 0;
    let attempts = 0;
    let placed = false;

    while (attempts < MAX_ATTEMPTS && !placed) {
      const candidateTop = Math.random() * 100;
      const candidateLeft = Math.random() * 100;
      const farEnough = stars.every((s) => Math.hypot(s.top - candidateTop, s.left - candidateLeft) >= MIN_DISTANCE);
      if (farEnough) {
        top = candidateTop;
        left = candidateLeft;
        placed = true;
      }
      attempts++;
    }
    if (!placed) {
      // Gave up finding a spaced-out spot — drop it in anyway rather than looping forever.
      top = Math.random() * 100;
      left = Math.random() * 100;
    }

    stars.push({
      id,
      top,
      left,
      size: 4 + Math.random() * 2.5,
      duration: 6 + Math.random() * 5,
      delay: Math.random() * 8,
      // Never fully solid — even at its brightest a star stays soft/translucent — but bright
      // enough to actually read against the site's light pastel backgrounds.
      peakOpacity: 0.55 + Math.random() * 0.2,
    });
  }

  return stars;
}

/**
 * Small twinkling sparkles scattered over the page, layered on top of DynamicBackground's gradient
 * circles. Positions/timings are randomized once per mount (not per render) so they don't jump
 * around. Each star has its own independent, staggered loop, slow and gentle: a soft glow blooms
 * in, holds briefly, then fades — never a quick flash — so it reads as "shining" rather than
 * blinking.
 *
 * The page's backgrounds are all pale pastel washes, so a plain white shape has almost no
 * luminance contrast to show against. Each sparkle keeps a faint dark contour (via drop-shadow,
 * which follows the star's silhouette rather than its bounding box) plus a brand-cyan-tinted glow
 * at its peak, so it shimmers instead of trying to out-brighten white.
 */
export const StarsBackground: React.FC = () => {
  // Mobile hardware is where all this ambient motion (this + the blur circles + backdrop-blur
  // cards) actually struggles to keep up during scroll — fewer independently-animating stars is
  // the cheap remaining lever after making each one itself cheaper (see the filter note below).
  const isMobile = useIsMobile();
  const stars = useMemo(() => generateStars(isMobile ? 18 : 40), [isMobile]);

  // h-[100lvh] (large viewport height, not dvh) — see DynamicBackground's note on why the
  // dynamic unit still lagged a beat behind Chrome mobile's address bar animation, and why
  // permanently sizing to the largest-possible viewport sidesteps that timing question entirely.
  return (
    <div className="fixed inset-x-0 top-0 h-[100lvh] -z-10 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.svg
          key={star.id}
          viewBox="0 0 24 24"
          className="absolute"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            // A static filter, set once and never touched again, instead of animating between
            // "dim" and "peak" drop-shadow strings — see the perf note below for why that
            // switch mattered. This lands roughly at the peak look permanently: not as dramatic
            // as the old bloom at its brightest instant, but the twinkle itself (still fully
            // animated via opacity/scale) carries the effect on its own well enough that the
            // difference barely reads, while the cost difference doesn't.
            filter: `drop-shadow(0 0 0.5px rgba(15,23,42,0.25)) drop-shadow(0 0 ${star.size}px rgba(56,189,248,${star.peakOpacity * 0.7}))`,
          }}
          // Animating `filter` here — 40 of these, independently, forever — used to interpolate
          // between full multi-layer drop-shadow() strings every frame. Unlike opacity/transform
          // (compositor-only, effectively free once GPU-promoted), a `filter` change forces a
          // repaint of the element's own layer on every tick it's actively managed by Framer,
          // regardless of whether the two keyframes it's holding between are identical — this was
          // one of the bigger contributors to scroll-time jank on real mobile hardware (much more
          // pronounced there than in desktop profiling, where the GPU headroom hides it). Keeping
          // the filter static and animating only opacity/scale keeps the twinkle but drops that
          // ongoing repaint cost to zero.
          //
          // On mobile, animate isn't even passed a target — the star just renders at its
          // brightest, biggest state permanently (no twinkle loop at all). The twinkle is a nice
          // touch but the LEAST important of the ambient background pieces; parked here rather
          // than animated at all is one less thing running continuously in the background while
          // real, structural mobile jank (the section-entrance burst, the address-bar gap) gets
          // sorted out.
          animate={
            isMobile
              ? { opacity: star.peakOpacity, scale: 1.3 }
              : {
                  opacity: [0.25, 0.25, star.peakOpacity, star.peakOpacity, 0.25],
                  scale: [0.85, 0.85, 1.3, 1.3, 0.85],
                }
          }
          transition={
            isMobile
              ? undefined
              : {
                  duration: star.duration,
                  times: [0, 0.35, 0.55, 0.8, 1],
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: star.delay,
                }
          }
        >
          <path d={SPARKLE_PATH} fill="white" />
        </motion.svg>
      ))}
    </div>
  );
};
