"use client";
import { motion, MotionConfig } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ClickRipple } from './components/ClickRipple';
import { DocumentTitleUpdater } from './components/DocumentTitleUpdater';
import { IntroScreen } from './components/IntroScreen';
import { Layout, Section } from './components/Layout';
import { AboutMe } from './components/sections/AboutMe';
import { Certifications } from './components/sections/Certifications';
import { Contact } from './components/sections/Contact';
import { Experience } from './components/sections/Experience';
import { Projects } from './components/sections/Projects';
import { WhatIBring } from './components/sections/WhatIBring';
import { VisitDurationTracker } from './components/VisitDurationTracker';
import { I18nProvider } from './contexts/i18nContext';
import { useInitialHashNavigation } from './hooks/useInitialHashNavigation';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import type { SupportedLang } from './hooks/usePreferredLanguage';
import { smoothScrollToElement } from './lib/smoothScroll';

interface AppClientProps {
  defaultLanguage: SupportedLang;
  visitId: string | null;
}

// Shared by most content sections below. `contentVisibility: 'auto'` tells the browser to skip
// layout/style/paint work entirely for a section's subtree while it's far from the viewport —
// every section here is mounted simultaneously (nothing is virtualized/lazy-mounted), each with
// its own tree of Framer Motion entrance animations, so without this the browser is maintaining
// render state for ALL six sections' worth of animated content at all times, on every scroll
// frame, even though at most one or two are ever visible. `containIntrinsicSize` gives the
// browser a placeholder size to reserve for a skipped section so the page's scrollable height
// doesn't jump around as sections pop in/out of "skipped" status — a one-viewport-tall estimate
// is close enough here (measured 10-25% off across About/Experience/Skills/Certifications/
// Contact) that content-visibility's own lookahead margin absorbs the difference with no visible
// jump. Chrome-only today; other browsers just ignore both properties and render normally, so
// this is a strict progressive enhancement, not a risk.
const SECTION_STYLE: CSSProperties = {
  minHeight: 'calc(var(--vh, 1vh) * 100)',
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto calc(var(--vh, 1vh) * 100)',
};

// Projects and Certifications deliberately do NOT get contentVisibility: both render a
// data-driven list of full-size cards (however many projects/certificates actually exist), so
// their true height has nothing to do with a single viewport — measured 4320px and 3676px fully
// rendered against this same one-viewport (900px) estimate. A placeholder that far off would make
// the scrollable page height (and therefore the scrollbar/scroll position) visibly jump the
// moment content-visibility flips from skipped to rendered, trading the jank this is meant to fix
// for a worse, more jarring one. Confirmed the other five sections don't have this problem by
// measuring each one's height before/after scrolling it into view — all matched within a normal
// entrance-animation's worth of difference, not off by thousands of pixels. Both sections' own
// cards already animate in/out individually via their own whileInView triggers, which covers
// part of the same "don't animate what's off-screen" goal this is going for elsewhere.
const VARIABLE_HEIGHT_SECTION_STYLE: CSSProperties = {
  minHeight: 'calc(var(--vh, 1vh) * 100)',
};

export default function AppClient({ defaultLanguage, visitId }: AppClientProps) {
  const [currentSection, setCurrentSection] = useState<Section>('intro');
  // Starts empty (not pre-filled) so it stays in sync with useIntersectionObserver's own tracking,
  // which also starts empty — otherwise a section that begins off-screen would be marked "already
  // revealed" before it's ever actually been seen, skipping its first genuine entrance animation.
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [preferredSection, setPreferredSection] = useState<Section | null>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const currentSectionRef = useRef<Section>('intro');
  // Reserved for potential future batching needs
  // const rafRef = useRef<number | null>(null);
  const validSections: Section[] = ['about-me', 'experience', 'skills', 'projects', 'certifications', 'contact'];

  // Visual-only hash update (no default jump)
  const updateHashVisual = (section: Section) => {
    const target = `#${section}`;
    if (window.location.hash !== target) {
      history.replaceState(null, '', target);
    }
  };

  // Check if accessing admin panel
  // const isAdminPanel = window && window.location.hash === '#admin';

  const handleIntroComplete = () => {
    setCurrentSection('about-me');
  };

  // Mirrors the intro→content transition in reverse: the whole content fades out over the same
  // 750ms the intro uses for its own exit, and only then does the branch below swap back to the
  // intro — which plays its usual entrance (fade in + typewriter restarting from the beginning).
  const [leavingToIntro, setLeavingToIntro] = useState(false);
  const handleReturnToIntro = useCallback(() => {
    setLeavingToIntro((alreadyLeaving) => {
      if (alreadyLeaving) return alreadyLeaving;
      setTimeout(() => {
        setLeavingToIntro(false);
        // Reset so every section replays its entrance when the user comes back in, exactly like
        // a fresh visit — matching how the observer re-tracks them from scratch.
        setVisibleSections(new Set());
        setCurrentSection('intro');
        history.replaceState(null, '', window.location.pathname);
        window.scrollTo(0, 0);
      }, 750);
      return true;
    });
  }, []);

  const scrollToSection = (section: Section) => {
    // Reflect active state immediately for mobile drawer highlight
    setCurrentSection(section);
    // Update URL visually as requested
    updateHashVisual(section);
    // Bias activation toward the target while smooth scrolling is in progress. Smooth-scroll
    // duration varies with distance (a click from "Sobre Mí" to "Contacto" travels much further
    // than to "Experiencia"), so a fixed timeout here was clearing this bias before a long scroll
    // actually finished — the anchor-based fallback would then briefly latch onto whatever section
    // was mid-scroll at that moment and never get corrected once the animation's last 'scroll'
    // event fired. `scrollend` fires exactly when the browser's scroll animation truly completes,
    // regardless of how long it took, so the bias now stays until the scroll is actually done.
    setPreferredSection(section);
    const clearPreferred = () => {
      setPreferredSection(null);
      window.clearTimeout(fallbackTimeout);
      window.removeEventListener('scrollend', clearPreferred);
    };
    window.addEventListener('scrollend', clearPreferred, { once: true });
    // Safety net for browsers without 'scrollend' (or if the scroll never truly settles).
    const fallbackTimeout = window.setTimeout(clearPreferred, 2500);

    const element = document.getElementById(section);
    if (element) {
      smoothScrollToElement(element);
    }
  };

  useEffect(() => {
    // Viewport height CSS var for mobile browsers (handle dynamic toolbars)
    let rafId: number | null = null;
    const setVh = () => {
      const base = (window.visualViewport?.height ?? window.innerHeight);
      const vh = base * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    const schedule = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(setVh);
    };
    setVh();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    // iOS Safari updates visualViewport (not a plain 'scroll' event) when toolbars hide/show,
    // so this alone covers the dynamic-toolbar case without needing a 'scroll' listener.
    // A 'scroll'-triggered version of this used to also run during in-page navigation: rewriting
    // --vh on every scroll frame forces layout recalculation on every section's min-height (they
    // all read var(--vh)), which was enough to stall the browser's native smooth-scroll animation
    // mid-flight when clicking a nav link — the page would stop scrolling partway and the section
    // never actually finished arriving, so it never got marked as current.
    window.visualViewport?.addEventListener('resize', schedule);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  // Toggles both ways (not just true) so a section's entrance animation replays every time it
  // scrolls back into view, rather than only the very first time it's ever seen.
  const handleVisibilityChange = useCallback((id: string, visible: boolean) => {
    setVisibleSections(prev => {
      if (visible === prev.has(id)) return prev;
      const next = new Set(prev);
      if (visible) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSectionChange = useCallback((id: string) => {
    if (id === currentSectionRef.current) return;
    // Side effect lives here, in the event-handler body — not inside a setState updater,
    // which must stay pure (React may invoke updaters more than once).
    updateHashVisual(id as Section);
    setCurrentSection(id as Section);
    setPreferredSection((preferred) => (preferred && id === preferred ? null : preferred));
  }, []);

  useIntersectionObserver({
    enabled: currentSection !== 'intro',
    minRatioToActivate: 0.2,
    activeAnchorRatio: 0.35,
    preferredId: preferredSection,
    onVisibilityChange: handleVisibilityChange,
    onSectionChange: handleSectionChange,
  });

  // Only apply hash on initial load (no updates during scroll/navigation)
  useInitialHashNavigation(validSections, (id) => {
    setCurrentSection(id as Section);
    scrollToSection(id as Section);
  }, currentSection !== 'intro');

  // Show admin panel if accessing via #admin
  // if (isAdminPanel) {
  //   return (
  //     <I18nProvider>
  //       <div className="min-h-screen bg-gray-50">
  //         <ContactAdmin />
  //       </div>
  //     </I18nProvider>
  //   );
  // }

  // One shared provider (rather than a separate instance per branch below) so
  // VisitDurationTracker keeps a single continuous elapsed-time clock across the intro→content
  // transition instead of remounting and losing the time spent on the intro screen.
  return (
    // reducedMotion="user" (not "always"): defers entirely to the OS-level "reduce motion"
    // setting rather than forcing it off for everyone. Tried forcing "always" for mobile at both
    // the app level and scoped to just <main> (the section content) as a fix for the
    // section-entrance animation cost — reverted both: even scoped to <main>, it also flattened
    // the Projects carousels' slide transitions (they live inside <main> too) into a hard cut
    // instead of a slide, and didn't net out to feeling faster overall. The entrance cost is
    // handled instead by more targeted fixes at the source (memoized sections, carousels pausing
    // their autoplay off-screen, a single pulsing timeline dot instead of one per item) rather
    // than a blanket "skip all transforms" hammer.
    <MotionConfig reducedMotion="user">
      <I18nProvider defaultLanguage={defaultLanguage}>
        <VisitDurationTracker visitId={visitId} />
        <DocumentTitleUpdater currentSection={currentSection} />

        {currentSection === 'intro' ? (
          <div className="size-full">
            <IntroScreen onComplete={handleIntroComplete} defaultLanguage={defaultLanguage} />
          </div>
        ) : (
          <motion.div
            className={`size-full ${leavingToIntro ? 'pointer-events-none' : ''}`}
            style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
            animate={{ opacity: leavingToIntro ? 0 : 1 }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
          >
            <ClickRipple />
            <Layout
              currentSection={currentSection}
              onSectionChange={scrollToSection}
              onLogoClick={handleReturnToIntro}
            >
              <div ref={sectionsRef} className="relative">
                <section
                  id="about-me"
                  data-section="about-me"
                  className="flex items-center justify-center py-20 relative -mt-28 pt-48 scroll-mt-28"
                  style={SECTION_STYLE}
                >
                  {/* Gradient overlay - starts white at the top and fades down (top half only) */}
                  <div className="absolute -top-24 left-0 right-0 bottom-0 bg-gradient-to-b from-[#f0f6fe]/70 from-0% via-[#f0f6fe]/70 via-30% to-transparent to-100% backdrop-blur-sm pointer-events-none" />
                  <div className="relative z-10 w-full px-2 sm:px-0">
                    <AboutMe isVisible={visibleSections.has('about-me')} />
                  </div>
                </section>
  
                <section
                  id="experience"
                  data-section="experience"
                  className="flex items-center justify-center py-20 scroll-mt-28"
                  style={SECTION_STYLE}
                >
                  <Experience isVisible={visibleSections.has('experience')} />
                </section>
  
                <section
                  id="skills"
                  data-section="skills"
                  className="flex items-center justify-center py-20 scroll-mt-28"
                  style={SECTION_STYLE}
                >
                  <WhatIBring isVisible={visibleSections.has('skills')} />
                </section>
  
                <section
                  id="projects"
                  data-section="projects"
                  className="scroll-mt-28"
                  style={VARIABLE_HEIGHT_SECTION_STYLE}
                >
                  <Projects isVisible={visibleSections.has('projects')} />
                </section>
  
                <section
                  id="certifications"
                  data-section="certifications"
                  className="flex items-center justify-center py-20 scroll-mt-28"
                  style={VARIABLE_HEIGHT_SECTION_STYLE}
                >
                  <Certifications isVisible={visibleSections.has('certifications')} />
                </section>
  
                <section
                  id="contact"
                  data-section="contact"
                  className="flex items-center justify-center py-20 scroll-mt-28"
                  style={SECTION_STYLE}
                >
                  <Contact isVisible={visibleSections.has('contact')} />
                </section>
              </div>
            </Layout>
          </motion.div>
        )}
      </I18nProvider>
    </MotionConfig>
  );
}
