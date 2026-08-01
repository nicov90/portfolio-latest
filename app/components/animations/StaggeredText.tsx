"use client";
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

interface StaggeredTextProps {
  /** The text to render. When this prop changes, the old text animates out and the new one
   * cascades in letter by letter. */
  text: string;
  className?: string;
  /** Per-letter hover micro-interaction: the hovered letter lifts slightly and glows. Opt-in,
   * meant for big display text (section/card titles) — on small labels it reads as noise. */
  hoverGlow?: boolean;
  /** Glow color, as an [r, g, b] triple (not a CSS string: both the solid fill and the
   * text-shadow need the same channels at different alphas). Defaults to brand cyan, which
   * reads crisply against neutral/black titles. */
  glowColor?: [number, number, number];
  /** Whether the hovered letter also lifts (scale + translateY), on top of the glow. Defaults to
   * true; set false when the ancestor uses `background-clip: text` (gradient titles) — see the
   * note above whileHover for why a per-letter `transform` there is a real Chromium bug, not a
   * style choice. */
  liftOnHover?: boolean;
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
const DEFAULT_GLOW: [number, number, number] = [0, 191, 230]; // brand cyan (#00bfe6)

export const StaggeredText: React.FC<StaggeredTextProps> = ({
  text,
  className,
  hoverGlow = false,
  glowColor = DEFAULT_GLOW,
  liftOnHover = true,
}) => {
  const letters = Array.from(text);
  const [gr, gg, gb] = glowColor;

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
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                // Zero-size transparent base shadow so the hover glow has something to
                // interpolate from (avoids a hard snap on the first hover frame).
                ...(hoverGlow ? { textShadow: '0 0 0px rgba(0, 191, 230, 0)' } : {}),
              }}
              initial={{ opacity: 0, y: -5 }}
              // The stagger delay lives INSIDE the animate target (not the shared `transition`
              // prop) so it only paces the entrance cascade — the shared transition below is what
              // hover-return uses, and a per-letter delay there would make letters visibly lag
              // when settling back after a hover.
              animate={{ opacity: 1, y: 0, transition: { duration: 0.28, delay: i * LETTER_STAGGER_S, ease: 'easeOut' } }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              whileHover={
                hoverGlow
                  ? {
                      // Lift (scale/translateY) is opt-out via `liftOnHover`, NOT just a style
                      // choice: giving a letter its own `transform` promotes it to its own GPU
                      // compositing layer, and when the ancestor uses `background-clip: text`
                      // (gradient titles), that promotion breaks the gradient's clip computation
                      // for the WHOLE title — confirmed via CDP screencast (not just
                      // getComputedStyle, which shows correct values throughout and misses this
                      // entirely since it's a paint/compositing bug, not a wrong style value).
                      // Tried pre-promoting via permanent `willChange: transform` to dodge the
                      // *timing* of layer creation — made it worse: ALL letters stayed broken
                      // permanently, not just mid-hover, since apparently bg-clip-text needs
                      // every glyph painted in the SAME layer to compute its mask at all. There's
                      // no known way to keep a per-letter transform here, so gradient titles get
                      // color + glow only; plain-color titles (no bg-clip-text) are unaffected by
                      // any of this and keep the full lift.
                      ...(liftOnHover ? { scale: 1.18, y: -2 } : {}),
                      color: `rgb(${gr}, ${gg}, ${gb})`,
                      textShadow: `0 0 8px rgba(${gr}, ${gg}, ${gb}, 0.8)`,
                      transition: {
                        // scale/y animate smoothly — pure geometry, no paint-model gotchas.
                        default: { duration: 0.15, ease: 'easeOut' },
                        // `color` snaps instantly rather than crossfading — an interpolated
                        // transparent -> solid color passes through barely-visible in-between
                        // rgba values that (independent of the lift issue above) also read as a
                        // brief disappearance. Confirmed via getComputedStyle sampling: it passed
                        // through rgba(0,20,24,0.01) at ~100ms with a crossfade.
                        color: { duration: 0 },
                      },
                    }
                  : undefined
              }
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
