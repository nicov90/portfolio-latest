"use client";
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * True while the given element is at least partially within the viewport (plus a little margin,
 * so it activates just before actually becoming visible). A thin wrapper around the browser's
 * native IntersectionObserver — deliberately NOT this app's own scroll-driven
 * useIntersectionObserver hook, which tracks a fixed set of top-level page sections for nav
 * highlighting; this is for gating per-instance background work (e.g. pausing a carousel's
 * autoplay) on arbitrary, possibly-many elements, which is a different enough job to want its
 * own observer instance per element rather than reusing that one.
 */
export function useInViewport<T extends Element>(ref: RefObject<T | null>): boolean {
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return isInViewport;
}
