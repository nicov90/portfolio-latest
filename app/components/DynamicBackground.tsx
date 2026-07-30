import { motion, useScroll, useTransform } from 'motion/react';
import React from 'react';

interface DynamicBackgroundProps {
  section: string;
}

// Define color schemes for each section
const sectionColorSchemes = {
  'about-me': {
    circle1: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)', // Blue-violet
    circle2: 'linear-gradient(135deg, #00bfe6 0%, #764ba2 100%)', // Cyan into purple
    circle3: 'linear-gradient(135deg, #a8c0ff 0%, #c7d2fe 100%)', // Soft periwinkle
    opacity1: 0.6,
    opacity2: 0.55,
    opacity3: 0.45
  },
  'experience': {
    circle1: 'linear-gradient(135deg, #0096c7 0%, #0077b6 100%)', // Deep cyan
    circle2: 'linear-gradient(135deg, #00bfe6 0%, #48cae4 100%)', // Cyan gradient
    circle3: 'linear-gradient(135deg, #90e0ef 0%, #ade8f4 100%)', // Light cyan
    opacity1: 0.6,
    opacity2: 0.6,
    opacity3: 0.5
  },
  'skills': {
    circle1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    circle2: 'linear-gradient(135deg, #00bfe6 0%, #4facfe 100%)', // Cyan-blue mix
    circle3: 'linear-gradient(135deg, #a8edea 0%, #c7e9fb 100%)', // Soft cyan
    opacity1: 0.6,
    opacity2: 0.6,
    opacity3: 0.5
  },
  'projects': {
    circle1: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-red
    circle2: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    circle3: 'linear-gradient(135deg, #00bfe6 0%, #48cae4 100%)', // Cyan
    opacity1: 0.7,
    opacity2: 0.6,
    opacity3: 0.5
  },
  'certifications': {
    circle1: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)', // Gold to dark blue (achievement)
    circle2: 'linear-gradient(135deg, #00bfe6 0%, #0096c7 100%)', // Cyan
    circle3: 'linear-gradient(135deg, #ffeaa7 0%, #fbc2eb 100%)', // Light gold-pink
    opacity1: 0.5,
    opacity2: 0.5,
    opacity3: 0.4
  },
  'contact': {
    circle1: 'linear-gradient(135deg, #00bfe6 0%, #0096c7 100%)', // Cyan primary
    circle2: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    circle3: 'linear-gradient(135deg, #48cae4 0%, #90e0ef 100%)', // Light cyan
    opacity1: 0.7,
    opacity2: 0.6,
    opacity3: 0.5
  }
};

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ section }) => {
  const colors = sectionColorSchemes[section as keyof typeof sectionColorSchemes] || sectionColorSchemes['about-me'];

  // Drifts the background gently as the page scrolls. `useScroll`/`useTransform` write directly
  // to a motion value and update the DOM outside React's render cycle, so this doesn't add any
  // re-renders on scroll — cheap, unlike the state-driven updates that used to stall scrolling
  // here (see the note below on why these circles don't remount per-section anymore).
  const { scrollYProgress } = useScroll();
  const PARALLAX_RANGE = 80; // px the inner layer drifts upward over a full page scroll
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -PARALLAX_RANGE]);

  // The outer layer is a plain (non-animated) fixed/inset-0 box — it must always match the
  // viewport exactly, or its bottom edge exposes bare white page background as it drifts. The
  // `y` transform instead lives on this inner layer, which is deliberately PARALLAX_RANGE taller
  // than 100% (extra height added only at the bottom, top stays put) so that even at maximum
  // upward drift its bottom edge still reaches the outer box's bottom edge — nothing is ever left
  // uncovered. Circle positions below are unchanged and stay pixel-identical to before at rest.
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
    <motion.div className="absolute inset-x-0 top-0" style={{ y: parallaxY, height: `calc(100% + ${PARALLAX_RANGE}px)` }}>
      {/* First Circle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 'calc(50vw + 50px)',
          height: '96vh',
          filter: 'blur(90px)',
          left: 'calc(50vw - 175px)',
          top: 0,
        }}
        initial={{
          background: colors.circle1,
          transform: 'translateX(0) rotate(0)',
          opacity: 0
        }}
        animate={{
          background: colors.circle1,
          transform: 'translateY(50px) scale(0.75) rotate(-15deg)',
          opacity: colors.opacity1,
        }}
        transition={{
          background: {
            duration: 0.8,
            ease: "easeInOut"
          },
          transform: {
            duration: 4.25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: [0.47, 0, 0.745, 0.715]
          },
          opacity: {
            duration: 0.8,
            ease: "easeInOut"
          }
        }}
      />

      {/* Second Circle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          maxWidth: '600px',
          width: 'calc(50vw + 50px)',
          height: '700px',
          filter: 'blur(90px)',
          top: 'calc(50vh - 25vw)',
          left: 'calc(25vw - 50px)',
        }}
        initial={{
          background: colors.circle2,
          transform: 'translateX(0) rotate(0)',
          opacity: 0
        }}
        animate={{
          background: colors.circle2,
          transform: 'translateX(-225px) scale(1.1) scaleX(1.2) rotate(-15deg)',
          opacity: colors.opacity2,
        }}
        transition={{
          background: {
            duration: 0.8,
            ease: "easeInOut"
          },
          transform: {
            duration: 4.25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: [0.47, 0, 0.745, 0.715]
          },
          opacity: {
            duration: 0.8,
            ease: "easeInOut"
          }
        }}
      />

      {/* Third Circle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '400px',
          height: '400px',
          filter: 'blur(80px)',
          top: '20vh',
          right: '10vw',
        }}
        initial={{
          background: colors.circle3,
          transform: 'scale(0) rotate(0)',
          opacity: 0
        }}
        animate={{
          background: colors.circle3,
          transform: 'scale(1) rotate(180deg)',
          opacity: colors.opacity3,
        }}
        transition={{
          background: {
            duration: 0.8,
            ease: "easeInOut"
          },
          transform: {
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
            ease: [0.47, 0, 0.745, 0.715]
          },
          opacity: {
            duration: 0.8,
            ease: "easeInOut"
          }
        }}
      />
    </motion.div>
    </div>
  );
};
