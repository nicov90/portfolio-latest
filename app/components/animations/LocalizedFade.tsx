"use client";
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { useAnimEnabled } from '../../lib/animationFlags';

interface LocalizedFadeProps {
  /** The text to render. When it changes, the old copy fades out and the new one fades in. */
  children: string;
  className?: string;
  /** Defaults to 'div'. Use 'span' when this ends up nested inside a <p> (e.g. wrapping an inline
   * piece of a paragraph) - a <div> isn't valid content there and browsers silently mangle the
   * DOM by closing the <p> early. */
  as?: 'div' | 'span';
}

/**
 * Block-level text transition: a quick dip-and-settle whenever the `children` string changes
 * (e.g. a language switch), instead of an instant swap. The whole block animates as ONE element —
 * use this for long or multiline text (paragraphs, subtitles); its counterpart StaggeredText does
 * a per-letter cascade and is only for short strings. Fully self-contained: its only dependency
 * is framer-motion (`motion/react`), portable to any React app as-is.
 *
 * How it works:
 * - `AnimatePresence mode="wait"` wraps a single motion element keyed by the text itself. When
 *   the text changes, the old element plays its `exit` tween (fade up+out, 0.12s) and only after
 *   it fully finishes does the new element mount and play its entrance (fade down+in, 0.18s).
 *   Framer's lifecycle guarantees that ordering — no timers or shared state to race against.
 * - `initial={false}` on AnimatePresence: the very first mount (page load) renders the text
 *   plainly; the transition only plays on subsequent text changes.
 * - Exit/enter durations are kept in sync with StaggeredText's so both kinds of text dip and
 *   return in the same rhythm when many elements change at once.
 *
 * Deliberately opacity/y only, no `filter` blur — this can wrap large subtrees, and animating
 * blur across that much content every frame is expensive enough to visibly stutter. It also
 * avoids `filter`'s side effect of becoming the containing block for `position: fixed`
 * descendants, which would break floating UI nested inside.
 *
 * Never combine this with StaggeredText on the same text: nesting two independently-timed
 * animation trees composites their opacities into a confusing "flickers once, then plays
 * properly" mess. Pick exactly one per piece of text.
 */
export const LocalizedFade: React.FC<LocalizedFadeProps> = ({ children, className, as = 'div' }) => {
  const MotionTag = motion[as];
  const animated = useAnimEnabled('textEntrances');

  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionTag
        key={children}
        className={className}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0, transition: animated ? { duration: 0.18, ease: 'easeOut' } : { duration: 0 } }}
        exit={{ opacity: 0, y: -4, transition: animated ? { duration: 0.12, ease: 'easeIn' } : { duration: 0 } }}
      >
        {children}
      </MotionTag>
    </AnimatePresence>
  );
};
