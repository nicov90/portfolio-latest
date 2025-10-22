"use client";
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const ClickRipple: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't create ripple if clicking on interactive elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        return;
      }

      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1200);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <React.Fragment key={ripple.id}>
            {/* Outer glow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                background: 'radial-gradient(circle, rgba(0, 191, 230, 0.4) 0%, rgba(0, 191, 230, 0.15) 50%, rgba(0, 191, 230, 0) 100%)',
              }}
              initial={{
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                opacity: 1,
              }}
              animate={{
                width: 120,
                height: 120,
                x: -60,
                y: -60,
                opacity: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
            {/* Main ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                border: '3px solid rgba(0, 191, 230, 0.7)',
                boxShadow: '0 0 20px rgba(0, 191, 230, 0.5), inset 0 0 20px rgba(0, 191, 230, 0.2)',
              }}
              initial={{
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                opacity: 1,
              }}
              animate={{
                width: 100,
                height: 100,
                x: -50,
                y: -50,
                opacity: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};
