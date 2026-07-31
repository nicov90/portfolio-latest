"use client";
import { motion } from 'motion/react';
import React from 'react';

interface SectionHeaderProps {
  /** Title content. Pass plain text or an already-wrapped node (e.g. an editable/translated
   * span) - this component only handles the entrance animation and typography, not the text
   * transition itself. */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Drives the entrance animation, typically from an IntersectionObserver ("animate in when the
   * section scrolls into view"). Defaults to true so the component also works standalone,
   * animating in on mount without any observer wiring. */
  isVisible?: boolean;
  /** Heading level for the title. Purely semantic (SEO/accessibility) - visual style is identical. */
  as?: 'h1' | 'h2';
  /** Extra classes for the outer animated container. Defaults keep the header centered with
   * bottom margin; pass e.g. "text-center" alone when the parent already handles spacing. */
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  /** Optional extra content rendered inside the animated container, after the subtitle - e.g. a
   * decorative underline bar with its own animation. */
  children?: React.ReactNode;
}

/**
 * Standard animated section header: big gradient title + optional subtitle, with a three-layer
 * staggered entrance. Extracted because every section repeated this exact block; using it keeps
 * timing/typography consistent and gives new sections a one-liner. Only dependency is
 * framer-motion + Tailwind classes, so it ports to any React+Tailwind app as-is.
 *
 * How the animation works (all driven by `isVisible`, so it replays when the section re-enters
 * the viewport and reverses out when it leaves):
 * - Outer container: fades in while sliding up 50px (0.8s). This is the "whole header arrives"
 *   layer.
 * - Title: fades in while scaling from 0.9 to 1 (1s, delayed 0.2s). Runs *inside* the container's
 *   animation, so it lags slightly behind - that overlap, not any single tween, is what gives the
 *   header its layered feel.
 * - Subtitle: fades in sliding up 20px (0.8s, delayed 0.4s), arriving last.
 *
 * The delays are absolute (both children start counting from the same moment the container
 * does), so the sequence reads: container starts -> 0.2s later title starts -> 0.2s after that
 * subtitle starts, all three finishing within ~1.2s.
 *
 * Text-change transitions (language switching) are NOT this component's job: pass a `title` node
 * that handles its own text swap (e.g. StaggeredText, or something wrapping it) and the two
 * animations compose fine - entrance moves the containers, text swap happens within them.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  isVisible = true,
  as = 'h1',
  className = 'text-center mb-16',
  titleClassName = 'text-4xl sm:text-5xl md:text-6xl leading-tight font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6',
  subtitleClassName = 'text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed',
  children,
}) => {
  const MotionHeading = motion[as];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={className}
    >
      <MotionHeading
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 1, delay: 0.2 }}
        className={titleClassName}
      >
        {title}
      </MotionHeading>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={subtitleClassName}
        >
          {subtitle}
        </motion.p>
      )}

      {children}
    </motion.div>
  );
};
