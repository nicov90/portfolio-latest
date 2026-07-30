function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Drives window scroll manually via requestAnimationFrame instead of the browser's native
 * `scrollIntoView({ behavior: 'smooth' })`. This page leans heavily on `backdrop-filter` and large
 * `blur()` background circles, which are expensive enough to repaint on every scroll frame that the
 * native smooth-scroll implementation can stall partway through a long scroll and never recover —
 * verified independently of any of our own JS by calling the native API directly with no app code
 * involved. Driving the position ourselves each frame means we can't be silently abandoned the same
 * way: dropped frames make the animation choppier, not incomplete.
 */
export function smoothScrollToElement(element: HTMLElement, duration = 700): Promise<void> {
  return new Promise((resolve) => {
    const scrollMarginTop = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
    const startY = window.scrollY;
    const targetY = Math.max(0, startY + element.getBoundingClientRect().top - scrollMarginTop);
    const distance = targetY - startY;

    if (Math.abs(distance) < 1) {
      resolve();
      return;
    }

    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Our own dispatch: repeated instant scrollTo() calls aren't guaranteed to be recognized
        // as a single native scroll gesture, so the browser's own 'scrollend' isn't reliable here.
        window.dispatchEvent(new Event('scrollend'));
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}
