import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

interface DynamicBackgroundProps {
  section: string;
}

// Define color schemes for each section
const sectionColorSchemes = {
  'about-me': {
    circle1: 'linear-gradient(135deg, #d5dfe8 0%, #b8c9db 100%)', // Soft gray-blue
    circle2: 'linear-gradient(135deg, #e8eef4 0%, #c8d5e3 100%)', // Very light gray-blue
    circle3: 'linear-gradient(135deg, #f0f6fe 0%, #dde7f2 100%)', // Almost white gray-blue
    opacity1: 0.6,
    opacity2: 0.5,
    opacity3: 0.4
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

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="sync">
        {/* First Circle */}
        <motion.div
          key={`circle1-${section}`}
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
          exit={{
            opacity: 0
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
          key={`circle2-${section}`}
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
          exit={{
            opacity: 0
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
          key={`circle3-${section}`}
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
          exit={{
            opacity: 0
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
      </AnimatePresence>
    </div>
  );
};
