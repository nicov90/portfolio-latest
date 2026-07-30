import React from 'react';
import { motion } from 'motion/react';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  onClick?: () => void;
}

export const AnimatedTextWord: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  speed = 0.5,
  className = '',
  onClick
}) => {
  const words = text.split(' ');

  return (
    <div className={`flex flex-wrap ${className}`} onClick={onClick}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: speed,
            delay: delay + index * 0.1,
            ease: "easeOut"
          }}
          className="mr-1"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

interface TypewriterTextProps {
  text: string;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <span className="invisible">{text}</span>
      <motion.span
        className="absolute top-0 left-0 text-black"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{
          duration: 4,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 4
        }}
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          borderRight: '2px solid black'
        }}
      >
        {text}
      </motion.span>
    </div>
  );
};