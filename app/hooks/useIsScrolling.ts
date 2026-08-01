"use client";
import { useMotionValue } from 'motion/react';
import { useEffect } from 'react';
import type { MotionValue } from 'motion/react';

// How long to wait after the last 'scroll' event before considering scrolling "over" — a
// fallback for input types (wheel/touch) that don't reliably fire the browser's native
// 'scrollend'. Short enough that pausing/resuming reads as tied to the scroll, not laggy itself.
const IDLE_TIMEOUT_MS = 150;

/**
 * A MotionValue<boolean> that's true while the page is scrolling, by any means — wheel, touch,
 * keyboard, or a programmatic scroll.
 *
 * Deliberately a MotionValue, NOT `useState` — this is meant to gate pausing expensive always-on
 * ambient work (the animated blur circles in DynamicBackground) for the exact duration of a
 * scroll, and a `useState`-driven boolean update goes through a normal React re-render before a
 * consumer's effect can react to it. On a page that's *already* struggling to keep up with the
 * main thread (the whole reason this exists), that extra render can get queued behind other
 * pending work and land too late to matter for a short scroll — confirmed directly: swapping
 * this from useState to a MotionValue was what took "still animating during the entire scroll"
 * to "actually frozen for its duration". `MotionValue.set()` and its `.on('change', ...)`
 * subscribers run synchronously, outside React's render cycle entirely.
 *
 * Deliberately does NOT resolve "scrolling has ended" from the native 'scrollend' event, only
 * from the idle timeout below — this app's own nav-triggered scroll (smoothScrollToElement)
 * drives position via repeated `window.scrollTo()` calls on a schedule of its own rather than a
 * single native smooth-scroll gesture, and confirmed via direct instrumentation: on a page
 * that's busy enough to have gaps between those calls, Chromium fires a REAL native 'scrollend'
 * after almost every individual jump, not just the final one — logged literally alongside every
 * 'scroll' event throughout an entire nav-triggered scroll, not once at the end. Reacting to it
 * flips this value back to false and resumes the very animation this hook exists to pause,
 * within the same scroll it was supposed to cover. The idle timeout has no such failure mode: it
 * only fires once genuinely nothing has scrolled for IDLE_TIMEOUT_MS.
 */
export function useIsScrolling(): MotionValue<boolean> {
  const isScrolling = useMotionValue(false);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      isScrolling.set(true);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => isScrolling.set(false), IDLE_TIMEOUT_MS);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isScrolling;
}
