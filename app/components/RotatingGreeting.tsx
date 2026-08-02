"use client";
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { getSavedLanguage } from '../hooks/usePreferredLanguage';
import { useAnimEnabled } from '../lib/animationFlags';

interface Greeting {
  code: string;
  hiIm: string;
  name: string;
}

// Katakana is the natural, expected way to render a foreign name in Japanese (résumés, business
// cards, etc.) — keeping the Latin spelling here would look out of place once everything else on
// this line is in Japanese. "です" is folded into the name line itself since hiIm/name render as
// two separate stacked lines rather than one concatenated sentence.
const GREETINGS: Greeting[] = [
  { code: 'es', hiIm: 'Hola, soy', name: 'Nicolas Valdez' },
  { code: 'en', hiIm: "Hi, I'm", name: 'Nicolas Valdez' },
  { code: 'ja', hiIm: 'こんにちは、', name: 'ニコラス・バルデスです' },
];

const TYPE_DURATION_S = 2.8; // typing out the name
const ERASE_DURATION_S = 1.1; // backspacing it before the next language
const HOLD_MS = 2200; // how long the fully-typed name stays before erasing starts

type Phase = 'typing' | 'erasing';

interface RotatingGreetingProps {
  active: boolean;
  initialLanguage: string;
  hiImClassName: string;
  nameClassName: string;
}

/**
 * A continuous typewriter loop: type the name out, hold, backspace it, move to the next
 * language, and repeat — the same "line" animation plays every cycle instead of only once at
 * the start.
 */
export const RotatingGreeting: React.FC<RotatingGreetingProps> = ({
  active,
  initialLanguage,
  hiImClassName,
  nameClassName,
}) => {
  // `initialLanguage` is resolved server-side (IP/region) and passed down once — it's not tied to
  // the site's live selected language, so it's safe to lock in on mount and never re-derive.
  const [index, setIndex] = useState<number>(() => {
    const matched = GREETINGS.findIndex((g) => g.code === initialLanguage);
    return matched === -1 ? 0 : matched;
  });
  const [phase, setPhase] = useState<Phase>('typing');

  // A previously explicit language choice (saved before this page load) should be what the
  // rotation starts from, taking priority over the geo-resolved default — but only checked once,
  // right at mount, before typing has meaningfully progressed. This deliberately does NOT
  // subscribe to later changes: switching languages mid-animation via the selector must not
  // interrupt the rotation, only a fresh page load should pick up a new saved choice.
  useEffect(() => {
    const saved = getSavedLanguage();
    if (!saved) return;
    const matched = GREETINGS.findIndex((g) => g.code === saved);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (matched !== -1) setIndex(matched);
  }, []);

  // Guards against React StrictMode's dev-only double-invocation of event handlers, and against
  // onAnimationComplete firing again for a phase that's already been handled.
  const canFireRef = useRef(true);
  useEffect(() => {
    canFireRef.current = true;
  }, [phase]);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  }, []);

  // Going inactive (the user clicked to leave the intro) freezes the loop wherever it is: an
  // already-armed hold timer would otherwise fire mid-exit and start erasing the name while the
  // screen fades, which reads as the animation reacting to the click.
  useEffect(() => {
    if (!active && holdTimerRef.current) clearTimeout(holdTimerRef.current);
  }, [active]);

  // Bisection testing (tablet/mobile): freeze on the first greeting, fully typed, no loop at all.
  const typewriterAnimated = useAnimEnabled('textEntrances');

  const handleTypingComplete = () => {
    if (!typewriterAnimated || !active || phase !== 'typing' || !canFireRef.current) return;
    canFireRef.current = false;
    holdTimerRef.current = setTimeout(() => setPhase('erasing'), HOLD_MS);
  };

  const handleErasingComplete = () => {
    if (!typewriterAnimated || !active || phase !== 'erasing' || !canFireRef.current) return;
    canFireRef.current = false;
    setIndex((prev) => (prev + 1) % GREETINGS.length);
    setPhase('typing');
  };

  const current = GREETINGS[index];

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <span className={`invisible whitespace-nowrap ${hiImClassName}`}>{current.hiIm}&nbsp;</span>
        <AnimatePresence>
          <motion.h5
            key={current.code}
            className={`absolute left-1/2 top-0 whitespace-nowrap ${hiImClassName}`}
            initial={{ opacity: 0, x: '-50%' }}
            animate={{ opacity: 1, x: '-50%' }}
            exit={{ opacity: 0, x: '-50%' }}
            transition={typewriterAnimated ? { duration: 0.5, ease: 'easeInOut' } : { duration: 0 }}
          >
            {current.hiIm}&nbsp;
          </motion.h5>
        </AnimatePresence>
      </div>

      <div className="relative">
        <span className={`invisible ${nameClassName}`}>{current.name}</span>
        <motion.span
          className={`absolute top-0 left-0 ${nameClassName}`}
          style={{ overflow: 'hidden', whiteSpace: 'nowrap', borderRight: '2px solid black' }}
          initial={{ width: '0%' }}
          // `active` deliberately NOT part of the width target: when the user clicks to leave the
          // intro mid-typing, flipping the target to 0% would visibly reverse the line right as
          // the screen fades out. Instead the in-flight tween finishes untouched and `active`
          // only stops the loop from scheduling its NEXT phase (checked in the handlers below).
          animate={{ width: typewriterAnimated ? (phase === 'typing' ? '100%' : '0%') : '100%' }}
          transition={typewriterAnimated ? {
            duration: phase === 'typing' ? TYPE_DURATION_S : ERASE_DURATION_S,
            ease: phase === 'typing' ? 'linear' : 'easeIn',
          } : { duration: 0 }}
          onAnimationComplete={() => {
            if (phase === 'typing') handleTypingComplete();
            else handleErasingComplete();
          }}
        >
          {current.name}
        </motion.span>
      </div>
    </div>
  );
};
