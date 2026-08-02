import type { MotionValue } from 'motion/react';
import { animate as animateValue, motion, useMotionValue, useScroll, useTransform } from 'motion/react';
import React, { useEffect, useRef } from 'react';
import { useIsScrolling } from '../hooks/useIsScrolling';
import { useAnimEnabled } from '../lib/animationFlags';

interface DynamicBackgroundProps {
  section: string;
}

// Define color schemes for each section
const sectionColorSchemes = {
  'about-me': {
    circle1: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)', // Blue-violet
    circle2: 'linear-gradient(135deg, #00bfe6 0%, #764ba2 100%)', // Cyan into purple
    circle3: 'linear-gradient(135deg, #a8c0ff 0%, #c7d2fe 100%)', // Soft periwinkle
    opacity1: 0.6,
    opacity2: 0.55,
    opacity3: 0.45
  },
  'experience': {
    circle1: 'linear-gradient(135deg, #0096c7 0%, #0077b6 100%)', // Deep cyan
    circle2: 'linear-gradient(135deg, #00bfe6 0%, #48cae4 100%)', // Cyan gradient
    circle3: 'linear-gradient(135deg, #90e0ef 0%, #ade8f4 100%)', // Light cyan
    opacity1: 0.6,
    opacity2: 0.6,
    opacity3: 0.5
  },
  'skills': {
    circle1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    circle2: 'linear-gradient(135deg, #00bfe6 0%, #4facfe 100%)', // Cyan-blue mix
    circle3: 'linear-gradient(135deg, #a8edea 0%, #c7e9fb 100%)', // Soft cyan
    opacity1: 0.6,
    opacity2: 0.6,
    opacity3: 0.5
  },
  'projects': {
    circle1: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-red
    circle2: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    circle3: 'linear-gradient(135deg, #00bfe6 0%, #48cae4 100%)', // Cyan
    opacity1: 0.7,
    opacity2: 0.6,
    opacity3: 0.5
  },
  'certifications': {
    circle1: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)', // Gold to dark blue (achievement)
    circle2: 'linear-gradient(135deg, #00bfe6 0%, #0096c7 100%)', // Cyan
    circle3: 'linear-gradient(135deg, #ffeaa7 0%, #fbc2eb 100%)', // Light gold-pink
    opacity1: 0.5,
    opacity2: 0.5,
    opacity3: 0.4
  },
  'contact': {
    circle1: 'linear-gradient(135deg, #00bfe6 0%, #0096c7 100%)', // Cyan primary
    circle2: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    circle3: 'linear-gradient(135deg, #48cae4 0%, #90e0ef 100%)', // Light cyan
    opacity1: 0.7,
    opacity2: 0.6,
    opacity3: 0.5
  }
};

// Each circle's drift, expressed as individual numeric transform axes (Framer's optimized,
// independently-animatable transform shorthands) rather than a single `transform` CSS string —
// see the note on Circle below for why that distinction is what makes pausing actually work.
// Axes not listed default to their CSS identity (0 for x/y/rotate, 1 for scale/scaleX/scaleY) and
// are simply never animated, matching the original `translate/scale/rotate(...)` strings exactly.
interface Axes {
  x?: number;
  y?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
}

interface CircleConfig {
  className: string;
  style: React.CSSProperties;
  from: Axes;
  to: Axes;
  duration: number;
}

const CIRCLES: CircleConfig[] = [
  {
    className: 'absolute rounded-full',
    style: { width: 'calc(50vw + 50px)', height: '96vh', filter: 'blur(80px)', left: 'calc(50vw - 175px)', top: 0 },
    from: { y: 0, scale: 1, rotate: 0 },
    to: { y: 50, scale: 0.75, rotate: -15 }, // translateY(50px) scale(0.75) rotate(-15deg)
    duration: 4.25,
  },
  {
    className: 'absolute rounded-full',
    style: { maxWidth: '600px', width: 'calc(50vw + 50px)', height: '700px', filter: 'blur(80px)', top: 'calc(50vh - 25vw)', left: 'calc(25vw - 50px)' },
    from: { x: 0, scaleX: 1, scaleY: 1, rotate: 0 },
    // translateX(-225px) scale(1.1) scaleX(1.2) rotate(-15deg): CSS scale() and scaleX() compound
    // multiplicatively, so the net per-axis scale is scaleX: 1.1*1.2=1.32, scaleY: 1.1.
    to: { x: -225, scaleX: 1.32, scaleY: 1.1, rotate: -15 },
    duration: 4.25,
  },
  {
    className: 'absolute rounded-full',
    style: { width: '400px', height: '400px', filter: 'blur(80px)', top: '20vh', right: '10vw' },
    from: { scale: 0, rotate: 0 },
    to: { scale: 1, rotate: 180 }, // scale(1) rotate(180deg)
    duration: 6,
  },
];

interface CircleProps {
  config: CircleConfig;
  background: string;
  opacity: number;
  isScrolling: MotionValue<boolean>;
  driftEnabled: boolean;
  colorFadeEnabled: boolean;
}

// One of the three ambient blur circles. `background`/`opacity` stay on the ordinary declarative
// `animate` prop (cheap, only actually transitions for 0.8s right after a section change,
// entirely unrelated to scroll). The infinite drift is different: it needs to be pausable
// mid-flight, without jumping, which ruled out two earlier approaches tried here —
// - A `transform` CSS *string* (e.g. "translateY(50px) scale(0.75) rotate(-15deg)") animated via
//   AnimationControls: calling `.start()` again to resume always restarted from the first
//   keyframe instead of resuming from wherever the string-interpolated value currently was,
//   producing a visible jump back to the start position every time a scroll began.
// - Passing `animate={controls}` at all conflicts with also wanting a separate, independently
//   reactive `animate={{background, opacity}}` on the same element — Framer only takes one
//   `animate` source per component.
// The fix: one plain `useMotionValue` per numeric transform axis this circle actually uses (x,
// y, scale, rotate, ...), each driven by its own standalone `animate()` call (the imported
// function, not a hook) bound directly into `style`. That returns real WAAPI-style playback
// controls with `.pause()`/`.play()` — pause freezes the value exactly where it is, play resumes
// from there, no restart and no jump — and because these motion values are separate from the
// `animate` prop entirely, they don't conflict with the background/opacity animation at all.
const Circle: React.FC<CircleProps> = ({ config, background, opacity, isScrolling, driftEnabled, colorFadeEnabled }) => {
  const x = useMotionValue(config.from.x ?? 0);
  const y = useMotionValue(config.from.y ?? 0);
  const scale = useMotionValue(config.from.scale ?? 1);
  const scaleX = useMotionValue(config.from.scaleX ?? 1);
  const scaleY = useMotionValue(config.from.scaleY ?? 1);
  const rotate = useMotionValue(config.from.rotate ?? 0);

  const playbackRef = useRef<ReturnType<typeof animateValue>[]>([]);

  useEffect(() => {
    // driftEnabled === false (bisection testing on tablet/mobile): skip the animation entirely and
    // just hold every axis at its resting `from` value — a fully static circle, no per-frame work.
    if (!driftEnabled) return;

    const axisPairs: Array<[typeof x, number, number]> = [
      [x, config.from.x ?? 0, config.to.x ?? 0],
      [y, config.from.y ?? 0, config.to.y ?? 0],
      [scale, config.from.scale ?? 1, config.to.scale ?? 1],
      [scaleX, config.from.scaleX ?? 1, config.to.scaleX ?? 1],
      [scaleY, config.from.scaleY ?? 1, config.to.scaleY ?? 1],
      [rotate, config.from.rotate ?? 0, config.to.rotate ?? 0],
    ];
    playbackRef.current = axisPairs
      // Skip axes this circle doesn't actually move on — nothing to animate, and it keeps
      // idle circles (e.g. circle 3 never touches x/y) from holding pointless playback handles.
      .filter(([, from, to]) => from !== to)
      .map(([motionValue, from, to]) =>
        animateValue(motionValue, [from, to], {
          duration: config.duration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: [0.47, 0, 0.745, 0.715],
        })
      );
    return () => playbackRef.current.forEach((playback) => playback.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driftEnabled]);

  useEffect(() => {
    if (!driftEnabled) return;
    // Subscribing directly to the MotionValue (not reading it as a React prop/state value) is
    // what makes this reaction synchronous with the scroll instead of waiting on a render —
    // see useIsScrolling's docs for why that distinction is the whole fix here.
    return isScrolling.on('change', (scrolling) => {
      playbackRef.current.forEach((playback) => (scrolling ? playback.pause() : playback.play()));
    });
  }, [isScrolling, driftEnabled]);

  return (
    <motion.div
      className={config.className}
      style={{ ...config.style, x, y, scale, scaleX, scaleY, rotate }}
      initial={{ background, opacity: 0 }}
      animate={{ background, opacity }}
      transition={colorFadeEnabled ? { duration: 0.8, ease: 'easeInOut' } : { duration: 0 }}
    />
  );
};

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ section }) => {
  const colors = sectionColorSchemes[section as keyof typeof sectionColorSchemes] || sectionColorSchemes['about-me'];
  const isScrolling = useIsScrolling();
  const driftEnabled = useAnimEnabled('backgroundDrift');
  const colorFadeEnabled = useAnimEnabled('backgroundColorFade');
  const parallaxEnabled = useAnimEnabled('backgroundParallax');

  // Drifts the background gently as the page scrolls. `useScroll`/`useTransform` write directly
  // to a motion value and update the DOM outside React's render cycle, so this doesn't add any
  // re-renders on scroll — cheap, unlike the state-driven updates that used to stall scrolling
  // here (see the note below on why these circles don't remount per-section anymore).
  //
  // Mobile-only: unlike the circles' own drift (paused via isScrolling above), this parallax was
  // never gated on scroll state at all — it's driven directly off scrollYProgress, so it writes a
  // new `y` on this huge fixed/blurred layer every single scroll frame, for the entire scroll,
  // with no pause. That's the one continuously-repainting piece left after every other mobile fix
  // (star pause, circle freeze, blur reduction) failed to resolve a real-device tearing artifact —
  // strong match for GPU tile desync on a large translating blurred layer. Zeroing the range on
  // mobile removes that continuous write (output is a constant 0, so the style never changes)
  // without touching desktop, where this subtle depth effect stays exactly as before.
  const { scrollYProgress } = useScroll();
  const PARALLAX_RANGE = 80; // px the inner layer drifts upward over a full page scroll
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, parallaxEnabled ? -PARALLAX_RANGE : 0]);

  // The outer layer is a plain (non-animated) fixed/inset-0 box — it must always match the
  // viewport exactly, or its bottom edge exposes bare white page background as it drifts. The
  // `y` transform instead lives on this inner layer, which is deliberately PARALLAX_RANGE taller
  // than 100% (extra height added only at the bottom, top stays put) so that even at maximum
  // upward drift its bottom edge still reaches the outer box's bottom edge — nothing is ever left
  // uncovered. Circle positions below are unchanged and stay pixel-identical to before at rest.
  return (
    // h-[100lvh] (large viewport height — the size WITHOUT the address bar, i.e. the maximum the
    // viewport can ever be), not h-dvh. dvh was the first attempt: `top/bottom:0` (inset-0) relies
    // on the browser recomputing that against whatever the CURRENT viewport height is, and dvh is
    // the unit built to track that live — but confirmed directly on-device that Chrome mobile only
    // resolves dvh once the address bar's show/hide animation actually settles, not continuously
    // during it: mid-scroll, while the bar is animating away, this stayed sized for the smaller
    // (bar-visible) viewport and only snapped to the correct size after scrolling stopped —
    // visible the whole time as a bare page-background strip along the bottom. Since this is
    // `position: fixed` anyway (it doesn't scroll with content, it only ever needs to cover
    // whatever's currently on screen), permanently sizing it to the LARGEST possible viewport
    // sidesteps the timing question entirely — it's already big enough for the bar-hidden state
    // before the bar even starts hiding, so there's nothing to catch up on.
    <div className="fixed inset-x-0 top-0 h-[100lvh] -z-10 overflow-hidden">
      <motion.div className="absolute inset-x-0 top-0" style={{ y: parallaxY, height: `calc(100% + ${PARALLAX_RANGE}px)` }}>
        <Circle config={CIRCLES[0]} background={colors.circle1} opacity={colors.opacity1} isScrolling={isScrolling} driftEnabled={driftEnabled} colorFadeEnabled={colorFadeEnabled} />
        <Circle config={CIRCLES[1]} background={colors.circle2} opacity={colors.opacity2} isScrolling={isScrolling} driftEnabled={driftEnabled} colorFadeEnabled={colorFadeEnabled} />
        <Circle config={CIRCLES[2]} background={colors.circle3} opacity={colors.opacity3} isScrolling={isScrolling} driftEnabled={driftEnabled} colorFadeEnabled={colorFadeEnabled} />
      </motion.div>
    </div>
  );
};
