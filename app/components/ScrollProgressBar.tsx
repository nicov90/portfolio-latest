"use client";
import { motion, useScroll, useSpring } from 'motion/react';
import React from 'react';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  // Small spring smoothing so the bar eases rather than jumping frame-to-frame.
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 origin-left z-[60] bg-gradient-to-r from-[#00bfe6] via-[#0096c7] to-[#764ba2]"
      style={{ scaleX }}
    />
  );
};
