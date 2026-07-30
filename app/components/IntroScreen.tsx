"use client";
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useI18n } from '../contexts/i18nContext';
import { AnimatedTextWord, TypewriterText } from './AnimatedText';
import { CirclesBackground } from './CirclesBackground';
import { LanguageSelector } from './LanguageSelector';

interface IntroScreenProps {
  onComplete: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const { t } = useI18n();
  const [startExitAnimation, setStartExitAnimation] = useState(false);
  const [animationEnded, setAnimationEnded] = useState(false);

  const handleClick = () => {
    if (animationEnded) {
      setStartExitAnimation(true);
      setTimeout(() => {
        onComplete();
      }, 750);
    }
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      <CirclesBackground exitAnimation={startExitAnimation} />
      
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen w-full cursor-pointer select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: startExitAnimation ? 0 : 1 }}
        transition={{ duration: startExitAnimation ? 0.75 : 1, ease: "easeInOut" }}
        onClick={handleClick}
        onAnimationComplete={() => !startExitAnimation && setAnimationEnded(true)}
      >
        <motion.div
          className="flex flex-col items-center justify-center relative gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <motion.h5
              className="text-4xl md:text-5xl font-light text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {t('intro.hiIm')}&nbsp;
            </motion.h5>
            
            <div className="relative">
              <TypewriterText 
                text="Nicolás Valdez" 
                className="text-4xl md:text-5xl font-light mt-2"
              />
            </div>
          </div>
          
          <motion.p
            className="text-xl md:text-2xl font-light select-none text-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            {t('intro.jobTitle')}
          </motion.p>
          
          <motion.div
            className="absolute top-full mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationEnded ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <AnimatedTextWord
              text={t('intro.clickToContinue')}
              delay={0}
              speed={0.75}
              className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors duration-300 text-gray-600"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};