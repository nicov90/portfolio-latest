"use client";
import { Star } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import React from 'react';

interface CreativeRoleCardProps {
  isVisible: boolean;
  title: React.ReactNode;
  suffix: React.ReactNode;
  tagline: React.ReactNode;
  chips: React.ReactNode[];
}

export const CreativeRoleCard: React.FC<CreativeRoleCardProps> = ({
  isVisible,
  title,
  suffix,
  tagline,
  chips,
}) => {
  // Cursor-follow 3D tilt: motion values updated directly on mousemove (no React re-render per
  // frame), springed for a smooth settle instead of snapping straight to the pointer.
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [9, -9]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-9, 9]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width);
    pointerY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.9, delay: 0.5, type: 'spring', bounce: 0.35 }}
      className="relative max-w-md mx-auto"
      style={{ perspective: 1200 }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative rounded-3xl p-8 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-2xl border border-white/50 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.2)] overflow-hidden"
      >
        <motion.div
          initial={{ rotate: -25, scale: 0 }}
          animate={isVisible ? { rotate: 0, scale: 1 } : { rotate: -25, scale: 0 }}
          transition={{ duration: 0.9, delay: 0.8, type: 'spring' }}
          className="absolute -top-10 -right-10 w-48 h-48 bg-[#00bfe6]/20 rounded-full blur-2xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col items-center text-center space-y-4 relative z-10"
          style={{ transform: 'translateZ(40px)' }}
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0, rotate: 90 }}
              animate={isVisible ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 90 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="w-24 h-24 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#00bfe6] to-[#0096c7] shadow-xl ring-4 ring-white/40"
            >
              <Star size={48} className="text-white drop-shadow" />
            </motion.div>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#004e92] to-[#000428] bg-clip-text text-transparent">
            {title} • {suffix}
          </h3>
          <p className="text-gray-700 leading-relaxed text-sm">{tagline}</p>
          <div className="flex gap-3 pt-2 flex-wrap justify-center">
            {chips.map((pill, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 1.1 + i * 0.07 }}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-white/50 backdrop-blur-md border border-white/60 text-[#005b7f] shadow-sm"
              >
                {pill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
