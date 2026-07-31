/**
 * Reusable animation components. Everything in this folder is deliberately self-contained -
 * the only dependencies are React, framer-motion (`motion/react`) and Tailwind class names -
 * so the whole directory can be copied into another project and used as-is.
 *
 * - StaggeredText: letter-by-letter cascade when a short string changes (titles, labels, logos).
 * - LocalizedFade: single-block dip-and-settle when a long/multiline string changes (paragraphs).
 *   These two are mutually exclusive per piece of text - pick one, never nest both.
 * - SectionHeader: standard section title + subtitle with a staggered scroll-in entrance.
 */
export { LocalizedFade } from './LocalizedFade';
export { SectionHeader } from './SectionHeader';
export { StaggeredText } from './StaggeredText';
