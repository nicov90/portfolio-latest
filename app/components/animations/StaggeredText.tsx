"use client";
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

interface StaggeredTextProps {
  /** The text to render. When this prop changes, the old text animates out and the new one
   * cascades in letter by letter. */
  text: string;
  className?: string;
}

// The gap between each letter's start - this is what makes it read as a run of piano notes
// rather than a block fading in. Not capped by total length: a few extra letters just means a
// slightly longer run, which still reads as smooth rather than rushed.
const LETTER_STAGGER_S = 0.045;

/**
 * Letter-by-letter text transition, triggered by the `text` prop changing (e.g. a language
 * switch). Meant for short strings (titles, labels, a logo) - not for paragraphs, where animating
 * hundreds of individual letters would be slow and read as a gimmick rather than a transition.
 * For long/multiline text use LocalizedFade instead. Fully self-contained: its only dependency
 * is framer-motion (`motion/react`), so it can be dropped into any React app as-is.
 *
 * How it works:
 * - The whole string is wrapped in `AnimatePresence mode="wait"` with a `motion.span` keyed by
 *   `text`. When `text` changes, React sees a new key, so AnimatePresence plays the old span's
 *   `exit` tween (quick fade up+out) and only mounts the new span once that has genuinely
 *   finished — Framer's own lifecycle guarantees the sequencing, no timers involved.
 * - The new span renders one `motion.span` per character (`Array.from` splits by code point so
 *   emoji/CJK don't break). Each letter starts hidden and fades/slides in with a delay
 *   proportional to its index — that per-index delay is the entire "stagger" effect.
 * - `initial={false}` on AnimatePresence means the very first mount (page load) renders the text
 *   plainly with no animation; the cascade only ever plays on a subsequent `text` change.
 * - `whiteSpace: 'pre'` on each letter matters: a lone space character as the sole content of an
 *   inline-block collapses to zero width under CSS whitespace rules, visually gluing words
 *   together without it.
 * - Accessibility: the wrapper carries `aria-label` with the full string and each letter span is
 *   `aria-hidden`, so screen readers announce one word instead of N letters.
 *
 * Do NOT nest this inside another animated wrapper that also fades on the same trigger (see
 * LocalizedFade's doc): two independently-timed opacity trees composite into visible glitches.
 * Also avoid it inside `background-clip: text` gradient elements — many separately-composited
 * letter layers can break the gradient paint for a few frames in Chromium.
 */
export const StaggeredText: React.FC<StaggeredTextProps> = ({ text, className }) => {
  const letters = Array.from(text);

  return (
    <span className={className} aria-label={text} style={{ display: 'inline-block' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={text}
          style={{ display: 'inline-block' }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12, ease: 'easeIn' } }}
        >
          {letters.map((char, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * LETTER_STAGGER_S, ease: 'easeOut' }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
