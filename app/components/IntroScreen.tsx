"use client";
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useI18n } from '../contexts/i18nContext';
import type { SupportedLang } from '../hooks/usePreferredLanguage';
import { useAnimEnabled } from '../lib/animationFlags';
import { AnimatedTextWord } from './AnimatedText';
import { CirclesBackground } from './CirclesBackground';
import { LanguageSelector } from './LanguageSelector';
import { RotatingGreeting } from './RotatingGreeting';

interface IntroScreenProps {
  onComplete: () => void;
  defaultLanguage: SupportedLang;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, defaultLanguage }) => {
  const { t } = useI18n();
  const [startExitAnimation, setStartExitAnimation] = useState(false);
  const [animationEnded, setAnimationEnded] = useState(false);
  const textAnimated = useAnimEnabled('textEntrances');
  const textTransition = (base: object) => (textAnimated ? base : { duration: 0 });

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
        transition={textTransition({ duration: startExitAnimation ? 0.75 : 1, ease: "easeInOut" })}
        onClick={handleClick}
        onAnimationComplete={() => !startExitAnimation && setAnimationEnded(true)}
      >
        <motion.div
          className="flex flex-col items-center justify-center relative gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={textTransition({ duration: 0.8, delay: 0.5 })}
        >
          <div className="flex flex-col items-center">
            <RotatingGreeting
              active={!startExitAnimation}
              initialLanguage={defaultLanguage}
              hiImClassName="text-4xl md:text-5xl font-light text-gray-800/85"
              nameClassName="text-4xl md:text-5xl font-normal mt-2 text-black"
            />
          </div>

          <motion.p
            // tracking-[0.2em] at this font-size is wide enough that on narrow phones (~320-360px)
            // Chromium's line-wrap check and its actual glyph-paint width disagree — the browser
            // decides the line fits without wrapping, then paints it wider than that, so it
            // overflows the viewport evenly on both sides instead of wrapping to a second line
            // (confirmed by reproducing/fixing it directly: halving the letter-spacing alone was
            // enough to bring the painted width back under the container). A tighter tracking on
            // the smallest breakpoint sidesteps the mismatch instead of chasing the browser bug.
            className="text-lg md:text-xl font-light uppercase tracking-[0.1em] sm:tracking-[0.2em] select-none text-gray-700/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={textTransition({ duration: 0.6, delay: 1.5 })}
          >
            {t('intro.jobTitle')}
          </motion.p>
          
          <motion.div
            className="hidden lg:block absolute top-full mt-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationEnded ? 1 : 0 }}
            transition={textTransition({ duration: 0.6, delay: 0.5 })}
          >
            <AnimatedTextWord
              text={t('intro.clickToContinue')}
              delay={0}
              speed={0.75}
              className="text-md font-medium cursor-pointer hover:text-blue-600 transition-colors duration-300 text-gray-700/70"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};