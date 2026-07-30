"use client";
import { motion } from 'motion/react';
import React, { useMemo } from 'react';

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
  const stars = useMemo(() => generateStars(40), []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
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
          }}
          animate={{
            opacity: [0.25, 0.25, star.peakOpacity, star.peakOpacity, 0.25],
            scale: [0.85, 0.85, 1.3, 1.3, 0.85],
            filter: [
              'drop-shadow(0 0 0.4px rgba(15,23,42,0.18)) drop-shadow(0 0 1px rgba(56,189,248,0.15))',
              'drop-shadow(0 0 0.4px rgba(15,23,42,0.18)) drop-shadow(0 0 1px rgba(56,189,248,0.15))',
              `drop-shadow(0 0 0.5px rgba(15,23,42,0.3)) drop-shadow(0 0 ${star.size * 1.6}px rgba(56,189,248,${star.peakOpacity})) drop-shadow(0 0 ${star.size * 0.8}px rgba(255,255,255,0.85))`,
              `drop-shadow(0 0 0.5px rgba(15,23,42,0.3)) drop-shadow(0 0 ${star.size * 1.6}px rgba(56,189,248,${star.peakOpacity})) drop-shadow(0 0 ${star.size * 0.8}px rgba(255,255,255,0.85))`,
              'drop-shadow(0 0 0.4px rgba(15,23,42,0.18)) drop-shadow(0 0 1px rgba(56,189,248,0.15))',
            ],
          }}
          transition={{
            duration: star.duration,
            times: [0, 0.35, 0.55, 0.8, 1],
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
          }}
        >
          <path d={SPARKLE_PATH} fill="white" />
        </motion.svg>
      ))}
    </div>
  );
};
