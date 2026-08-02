"use client";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import React from 'react';
import { useAnimEnabled } from '../../../lib/animationFlags';

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
  const cardsAnimated = useAnimEnabled('cardEntrances');
  const entranceTransition = (base: object) => (cardsAnimated ? base : { duration: 0 });

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
      transition={entranceTransition({ duration: 0.9, delay: 0.5, type: 'spring', bounce: 0.35 })}
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
          transition={entranceTransition({ duration: 0.9, delay: 0.8, type: 'spring' })}
          className="absolute -top-10 -right-10 w-48 h-48 bg-[#00bfe6]/20 rounded-full blur-2xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={entranceTransition({ duration: 0.6, delay: 0.9 })}
          className="flex flex-col items-center text-center space-y-4 relative z-10"
          style={{ transform: 'translateZ(40px)' }}
        >
          <div className="relative -mt-5 mb-1">
            <motion.div
              initial={{ scale: 0, rotate: 90 }}
              animate={isVisible ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 90 }}
              transition={entranceTransition({ duration: 0.7, delay: 1 })}
              className="w-48"
              style={{ aspectRatio: '1400 / 990' }}
            >
              <DotLottieReact
                src="/animations/Coding.json"
                loop={cardsAnimated}
                autoplay={cardsAnimated}
                // `renderConfig.autoResize` never actually resized the underlying <canvas>'s
                // width/height attributes in testing — it stayed at the browser's 300x150 canvas
                // default (a 2:1 ratio) while CSS stretched it to fit our 1400:990 box, distorting
                // the animation horizontally. Passing width/height directly sets the canvas's real
                // pixel buffer to the source's exact aspect ratio (scaled down 2.5x, still sharp
                // at this display size), so nothing needs to stretch unevenly.
                width={560}
                height={396}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#004e92] to-[#000428] bg-clip-text text-transparent">
              {title}
            </h3>
            <p className="text-sm font-medium text-[#0096c7] mt-1">{suffix}</p>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm">{tagline}</p>
          <div className="flex gap-3 pt-2 flex-wrap justify-center">
            {chips.map((pill, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={entranceTransition({ duration: 0.4, delay: 1.1 + i * 0.07 })}
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
