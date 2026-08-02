import { motion } from 'motion/react';
import React from 'react';
import { useAnimEnabled } from '../lib/animationFlags';

interface CirclesBackgroundProps {
  exitAnimation?: boolean;
}

export const CirclesBackground: React.FC<CirclesBackgroundProps> = ({
  exitAnimation = false
}) => {
  const driftEnabled = useAnimEnabled('backgroundDrift');
  // Tablet/mobile bisection off: skip the infinite drift loop, jump straight to each circle's
  // resting transform, and drop the opacity fade to an instant show/hide — still respects
  // exitAnimation (circles disappear when leaving the intro), just without any easing over time.
  const driftDuration = (base: number) => (driftEnabled ? base : 0);
  const driftRepeat = driftEnabled ? Infinity : 0;
  return (
    <>
      {/* First Circle - Purple/Pink gradient */}
      <motion.div
        className="fixed -z-10 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: 'calc(50vw + 50px)',
          height: '96vh',
          filter: 'blur(80px)',
          left: 'calc(50vw - 175px)',
          top: 0,
          opacity: 0.8
        }}
        initial={{ 
          transform: 'translateX(0) rotate(0)', 
          opacity: 0 
        }}
        animate={{
          transform: 'translateY(50px) scale(0.75) rotate(-15deg)',
          opacity: exitAnimation ? 0 : 0.8,
        }}
        transition={{
          ease: [0.47, 0, 0.745, 0.715],
          transform: {
            duration: exitAnimation ? 0.75 : driftDuration(4.25),
            repeat: exitAnimation ? 0 : driftRepeat,
            repeatType: "reverse",
          },
          opacity: {
            duration: exitAnimation ? 2 : 1.5,
            delay: 0.5,
          }
        }}
      />
      
      {/* Second Circle - Pink/Red gradient */}
      <motion.div
        className="fixed -z-10 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          maxWidth: '600px',
          width: 'calc(50vw + 50px)',
          height: '700px',
          filter: 'blur(80px)',
          top: 'calc(50vh - 25vw)',
          left: 'calc(25vw - 50px)',
          opacity: 0.8
        }}
        initial={{ 
          transform: 'translateX(0) rotate(0)', 
          opacity: 0 
        }}
        animate={{
          transform: 'translateX(-225px) scale(1.1) scaleX(1.2) rotate(-15deg)',
          opacity: exitAnimation ? 0 : 0.8,
        }}
        transition={{
          ease: [0.47, 0, 0.745, 0.715],
          transform: {
            duration: exitAnimation ? 0.75 : driftDuration(4.25),
            repeat: exitAnimation ? 0 : driftRepeat,
            repeatType: "reverse",
          },
          opacity: {
            duration: exitAnimation ? 2 : 1.5,
            delay: 0.8,
          }
        }}
      />

      {/* Third Circle - Blue/Cyan gradient */}
      <motion.div
        className="fixed -z-10 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          width: '400px',
          height: '400px',
          filter: 'blur(80px)',
          top: '20vh',
          right: '10vw',
          opacity: 0.6
        }}
        initial={{ 
          transform: 'scale(0) rotate(0)', 
          opacity: 0 
        }}
        animate={{
          transform: 'scale(1) rotate(180deg)',
          opacity: exitAnimation ? 0 : 0.6,
        }}
        transition={{
          ease: [0.47, 0, 0.745, 0.715],
          transform: {
            duration: exitAnimation ? 0.75 : driftDuration(6),
            repeat: exitAnimation ? 0 : driftRepeat,
            repeatType: "reverse",
          },
          opacity: {
            duration: exitAnimation ? 2 : 2,
            delay: 1.2,
          }
        }}
      />
    </>
  );
};