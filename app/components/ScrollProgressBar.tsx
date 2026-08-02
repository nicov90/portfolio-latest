"use client";
import { motion, useScroll, useSpring } from 'motion/react';
import React from 'react';
import { useAnimEnabled } from '../lib/animationFlags';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  // Small spring smoothing so the bar eases rather than jumping frame-to-frame.
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 30, restDelta: 0.001 });
  // Bisection testing (tablet/mobile): same shape of suspect as the background parallax that was
  // confirmed to write a `transform` on a fixed layer every scroll frame — this bar does too
  // (scaleX tracks scroll position continuously via a spring). Hidden entirely while disabled
  // rather than half-implemented as "static," since a progress bar frozen at a stale scroll
  // position would just be visibly wrong.
  const enabled = useAnimEnabled('microInteractions');
  if (!enabled) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 origin-left z-[60] bg-gradient-to-r from-[#00bfe6] via-[#0096c7] to-[#764ba2]"
      style={{ scaleX }}
    />
  );
};
