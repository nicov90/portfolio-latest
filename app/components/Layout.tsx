import { motion } from 'motion/react';
import React from 'react';
import { useI18n } from '../contexts/i18nContext';
import { DynamicBackground } from './DynamicBackground';
import { LanguageSelector } from './LanguageSelector';

export type Section = 'intro' | 'about-me' | 'experience' | 'skills' | 'projects' | 'certifications' | 'contact';

interface LayoutProps {
  children: React.ReactNode;
  currentSection: Section;
  onSectionChange: (section: Section) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentSection, 
  onSectionChange 
}) => {
  const { t } = useI18n();

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
      
      {/* Fixed Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] max-w-6xl"
      >
        <div className="bg-white/25 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => onSectionChange('about-me')}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nicolás Valdez
              </h2>
            </motion.div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.key}
                  onClick={() => onSectionChange(item.key)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    currentSection === item.key
                      ? 'bg-white/30 text-blue-600 shadow-lg'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* Language Selector */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <LanguageSelector />
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90vw]"
      >
        <div className="bg-white/25 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl p-4">
          <div className="grid grid-cols-5 gap-2">
            {navItems.map((item, index) => (
              <motion.button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.6 + (index * 0.1),
                  type: "spring",
                  bounce: 0.4
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-xl font-medium text-xs transition-all duration-300 ${
                  currentSection === item.key
                    ? 'bg-white/30 text-blue-600 shadow-lg'
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-24 pb-32 md:pb-8">
        {children}
      </main>
    </div>
  );
};