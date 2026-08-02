import { Github, Linkedin, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import { getSiteOwnerName } from '../../lib/siteOwner';
import { useI18n } from '../contexts/i18nContext';
import { useAnimEnabled } from '../lib/animationFlags';
import { LocalizedFade, StaggeredText } from './animations';
import { DynamicBackground } from './DynamicBackground';
import { LanguageSelector } from './LanguageSelector';
import { ScrollProgressBar } from './ScrollProgressBar';
import { SocialSidebar } from './SocialSidebar';
import { StarsBackground } from './StarsBackground';

export type Section = 'intro' | 'about-me' | 'experience' | 'skills' | 'projects' | 'certifications' | 'contact';

interface LayoutProps {
  children: React.ReactNode;
  currentSection: Section;
  onSectionChange: (section: Section) => void;
  /** Fired when the user clicks the name/logo — returns to the intro screen. */
  onLogoClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentSection,
  onSectionChange,
  onLogoClick,
}) => {
  const { t, language } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navDrawerAnimated = useAnimEnabled('navDrawer');
  const microAnimated = useAnimEnabled('microInteractions');
  const microTransition = (base: object) => (microAnimated ? base : { duration: 0 });
  const drawerTransition = (base: object) => (navDrawerAnimated ? base : { duration: 0 });

  const navItems: { key: Section; label: string }[] = [
    { key: 'about-me', label: t('navigation.aboutMe') },
    { key: 'experience', label: t('navigation.experience') },
    { key: 'skills', label: t('navigation.skills') },
    { key: 'projects', label: t('navigation.projects') },
    { key: 'certifications', label: t('navigation.certifications') },
    { key: 'contact', label: t('navigation.contact') }
  ];

  return (
    <div className="relative min-h-screen">
      <DynamicBackground section={currentSection} />
      <StarsBackground />
      <ScrollProgressBar />

      {/* Soft scrim behind the floating nav: without it, whatever section content is scrolled
          to just past its edges (the pill nav isn't full-width/opaque) peeks through around it —
          most visible as a sliver of the previous section's trailing text right above the pill. */}
      <div className="fixed top-0 inset-x-0 h-32 bg-gradient-to-b from-white via-white/60 to-transparent z-40 pointer-events-none" />

      {/* Desktop floating socials */}
      <SocialSidebar />

      {/* Fixed Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={microTransition({ duration: 0.8, delay: 0.2 })}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] max-w-6xl"
      >
        <div className="bg-white/25 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo: a soft shine sweeps across the gradient text on hover instead of scaling up.
                Uses LocalizedFade, not StaggeredText like the nav labels below - animating many
                individually-transformed letter spans inside this bg-clip-text gradient caused a
                real (if obscure) rendering glitch: the text would render visibly cut off/missing
                its top portion for a few frames during a language switch. A single fading element
                doesn't hit whatever compositing edge case that per-letter one does. */}
            <div className="cursor-pointer" onClick={onLogoClick} title={t('navigation.home')}>
              <motion.h2
                className="text-lg sm:text-2xl font-bold tracking-tight sm:tracking-normal whitespace-nowrap bg-gradient-to-r from-blue-600 via-purple-500 via-45% to-blue-600 bg-clip-text text-transparent"
                style={{ backgroundSize: '220% auto', backgroundPosition: '0% center' }}
                whileHover={{ backgroundPosition: '100% center' }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              >
                <LocalizedFade as="span">{getSiteOwnerName(language)}</LocalizedFade>
              </motion.h2>
            </div>

            {/* Navigation Items: visible from lg (1024px) so laptops get the real navbar instead
                of the mobile FAB. Spanish labels ("Certificaciones", "Mis Habilidades") are the
                longest of the supported locales and used to wrap at lg with the roomier xl
                sizing, blowing up the pill's height — so lg uses tighter padding + text-sm and
                only from xl (1280px) does it relax to the full size. */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.key}
                  onClick={() => onSectionChange(item.key)}
                  initial={{ opacity: 0, y: -20, backgroundColor: 'rgba(255, 255, 255, 0)' }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: currentSection === item.key ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)',
                  }}
                  transition={{
                    opacity: { duration: 0.4, delay: 0.4 + (index * 0.1) },
                    y: { duration: 0.4, delay: 0.4 + (index * 0.1) },
                    backgroundColor: { duration: 0.2, ease: 'easeOut' },
                  }}
                  whileHover={{
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    transition: { duration: 0.15, ease: 'easeOut' }
                  }}
                  whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                  className={`px-2.5 xl:px-4 py-2 rounded-xl text-sm xl:text-base font-medium cursor-pointer transition-[color] duration-300 ${
                    currentSection === item.key
                      ? 'text-blue-600 shadow-lg'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <StaggeredText text={item.label} />
                </motion.button>
              ))}
            </div>

            {/* Language Selector with mobile socials to the left */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={microTransition({ duration: 0.4, delay: 0.8 })}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Mobile/tablet socials: left of language selector (desktop gets the floating
                    sidebar instead from lg up) */}
                <div className="flex items-center gap-2.5 sm:gap-3 lg:hidden">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="text-gray-800 hover:text-gray-900"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-gray-800 hover:text-gray-900"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
                <LanguageSelector />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile: Floating Action Button + Bottom Drawer */}
      {/* FAB */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={drawerTransition({ duration: 0.6, delay: 0.4 })}
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white/55 backdrop-blur-xl border border-white/60 shadow-2xl flex items-center justify-center"
        aria-label="Open navigation"
      >
        <Menu className="text-gray-800" />
      </motion.button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 z-40 bg-black/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={drawerTransition({ duration: 0.2 })}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Bottom Drawer */}
            <motion.div
              className="lg:hidden fixed left-1/2 -translate-x-1/2 bottom-0 z-50 w-[94vw] max-w-md"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={drawerTransition({ type: 'spring', stiffness: 260, damping: 28 })}
            >
              <div className="bg-white/30 backdrop-blur-xl border border-white/30 shadow-2xl rounded-t-3xl p-4 max-h-[60vh] overflow-auto">
                {/* Drawer Handle + Close */}
                    <div className="flex items-center justify-center mb-3">
                      <div className="h-1.5 w-16 rounded-full bg-white/60" />
                    </div>

                {/* Nav Items Column */}
                <div className="mt-2 flex flex-col gap-2">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.key}
                      onClick={() => {
                        onSectionChange(item.key);
                        setDrawerOpen(false);
                      }}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={drawerTransition({ duration: 0.25, delay: 0.05 * index })}
                      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                      className={`w-full text-center px-4 py-4 rounded-xl cursor-pointer transition-colors duration-300 ${
                        currentSection === item.key
                          ? 'bg-white/55 text-blue-700 border border-white/60 shadow-lg'
                          : 'bg-white/25 text-gray-800'
                      }`}
                    >
                      <span className="block text-base font-medium">
                        <StaggeredText text={item.label} />
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24">
        {children}
      </main>

      {/* Minimal footer: a hairline over glass, name + socials. Bottom padding clears the
          mobile FAB (bottom-6 + 56px tall) so the FAB never covers the links. */}
      <footer className="relative z-10 pb-28 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* justify-between from sm (splits copyright/icons to opposite edges) but back to
              -center from lg: the icons div hides at that breakpoint (sidebar takes over), and
              -between with a single remaining child left-aligns it — a lone line of text sitting
              off to the left reads as unbalanced, so it's re-centered once it's on its own. */}
          <div className="border-t border-white/40 pt-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between lg:justify-center gap-3 text-sm text-gray-600">
            <span>© {new Date().getFullYear()} {getSiteOwnerName(language)}</span>
            {/* Hidden from lg up: the floating SocialSidebar already covers those breakpoints,
                so showing both would just be the same two icons twice on the same screen. Below
                lg the sidebar is hidden, making this the only place they appear. */}
            <div className="flex items-center gap-4 lg:hidden">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};