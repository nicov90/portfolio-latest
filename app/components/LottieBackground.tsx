"use client";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import React, { useEffect, useState } from 'react';

// Fullscreen canvases are expensive: on a 4K + high-DPR display an uncapped buffer would mean
// re-rasterizing 8M+ pixels 60 times a second for a *background*. 2x is visually
// indistinguishable from native DPR at this opacity while halving the worst-case cost.
const MAX_DPR = 2;

interface LottieBackgroundProps {
  /** Path to a Lottie JSON under /public. */
  src: string;
  /** Playback rate; 1 is the file's native speed. */
  speed?: number;
  /** Layer opacity for the whole animation. Keep low: the site's UI is translucent
   * glassmorphism, so background layers always show through cards and around text. */
  opacity?: number;
  /** Multiplier applied to each drawn element's own scale transform, shrinking every element in
   * place (positions, motion paths and full-screen coverage untouched). See scaleShapeGroups for
   * how and why. */
  elementScale?: number;
}

// True if a shape-group directly draws something (contains a path/primitive), as opposed to a
// container group that only nests other groups.
function isLeafGroup(group: any): boolean {
  return (group.it ?? []).some((item: any) => ['sh', 'el', 'sr', 'rc'].includes(item.ty));
}

// Shrinks each individually-drawn element in place by scaling LEAF shape-groups' own transforms
// (recursing through container groups without touching them, so nothing gets scaled twice).
//
// This is deliberately NOT done at the layer level: scaling a whole layer works when a file has
// one root layer per element, but for "field" layers (one layer holding a whole screenful of
// stars) it behaves like zooming the field out around its anchor — the artwork no longer reaches
// the screen edges, which showed up as a starless bottom quarter when this component first tried
// it. Leaf groups are each element's own drawing, so scaling their transform shrinks the element
// around its own anchor while its position — static or animated (twinkle pulses live in these
// same scale tracks, and get proportionally preserved) — stays exactly where the artist put it.
function scaleShapeGroups(shapes: any[], factor: number): void {
  for (const shape of shapes ?? []) {
    if (shape.ty !== 'gr') continue;
    if (!isLeafGroup(shape)) {
      scaleShapeGroups(shape.it ?? [], factor);
      continue;
    }
    const transform = (shape.it ?? []).find((item: any) => item.ty === 'tr');
    const scale = transform?.s;
    if (!scale) continue;
    if (!scale.a && Array.isArray(scale.k)) {
      // Static scale; sign preserved (negative x mirrors the element).
      scale.k = scale.k.map((v: number, i: number) => (i < 2 ? v * factor : v));
    } else if (scale.a && Array.isArray(scale.k)) {
      // Animated scale (e.g. a twinkle pulse): shrink every keyframe proportionally.
      for (const keyframe of scale.k) {
        if (Array.isArray(keyframe.s)) {
          keyframe.s = keyframe.s.map((v: number, i: number) => (i < 2 ? v * factor : v));
        }
      }
    }
  }
}

function shrinkElements(animation: any, factor: number): any {
  for (const layer of animation.layers ?? []) {
    scaleShapeGroups(layer.shapes ?? [], factor);
  }
  return animation;
}

/**
 * Subtle looping Lottie animation covering the whole viewport, painted behind the UI — same
 * fixed -z-10 layer as the other background pieces, and Layout mounts it at the very bottom of
 * that stack (underneath even the gradient blobs, which veil it further). Like StarsBackground,
 * it must read as ambience, never compete with content. Note the UI itself is translucent
 * glassmorphism, so background elements are always partially visible through cards and around
 * text; "behind everything" here means both the z-order AND being faint enough that showing
 * through the glass doesn't distract.
 *
 * Rendering quality: intended for pure-vector sources, where sharpness is decided entirely by
 * the canvas buffer size. `autoResize` doesn't actually resize the buffer (see CreativeRoleCard
 * for the original finding), so the buffer is sized manually to the real viewport *
 * devicePixelRatio (capped) and re-sized on window resize — the animation is re-rasterized at
 * exact display resolution instead of CSS-stretching a fixed-size buffer. `layout fit: 'cover'`
 * handles the 16:9 source vs. arbitrary viewport mismatch inside the canvas (cropping edges
 * rather than distorting), so no object-fit tricks are needed.
 */
export const LottieBackground: React.FC<LottieBackgroundProps> = ({
  src,
  speed = 1,
  opacity = 0.25,
  elementScale = 1,
}) => {
  // 0x0 until measured client-side (SSR has no window): DotLottieReact only mounts once real
  // dimensions exist, avoiding a first paint at a wrong default buffer size.
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  // The animation JSON is fetched manually (instead of passing `src` through) so the layers can
  // be rewritten to a smaller scale before the player ever parses it.
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(JSON.stringify(shrinkElements(json, elementScale)));
      })
      .catch(() => {
        // Background garnish only — if it can't load, render nothing rather than surface an error.
      });
    return () => {
      cancelled = true;
    };
  }, [src, elementScale]);

  useEffect(() => {
    let rafId: number | null = null;
    const measure = () => {
      rafId = null;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      setSize({ w: Math.round(window.innerWidth * dpr), h: Math.round(window.innerHeight * dpr) });
    };
    const schedule = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('resize', schedule);
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  if (!size || !data) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <DotLottieReact
        data={data}
        loop
        autoplay
        speed={speed}
        width={size.w}
        height={size.h}
        layout={{ fit: 'cover', align: [0.5, 0.5] }}
        style={{ width: '100%', height: '100%', opacity }}
      />
    </div>
  );
};
