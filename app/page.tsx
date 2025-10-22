"use client";
import { useEffect, useRef, useState } from 'react';
import { ClickRipple } from './components/ClickRipple';
import { DevProjectsControl } from './components/dev/DevProjectsControl';
import { IntroScreen } from './components/IntroScreen';
import { Layout, Section } from './components/Layout';
import { AboutMe } from './components/sections/AboutMe';
import { Certifications } from './components/sections/Certifications';
import { Contact } from './components/sections/Contact';
import { Experience } from './components/sections/Experience';
import { Projects } from './components/sections/Projects';
import { WhatIBring } from './components/sections/WhatIBring';
import { I18nProvider } from './contexts/i18nContext';

export default function App() {
  const [currentSection, setCurrentSection] = useState<Section>('intro');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['about-me', 'experience', 'skills', 'projects', 'certifications', 'contact']));
  const sectionsRef = useRef<HTMLDivElement>(null);
  
  // Check if accessing admin panel
  // const isAdminPanel = window && window.location.hash === '#admin';

  const handleIntroComplete = () => {
    setCurrentSection('about-me');
  };

  const scrollToSection = (section: Section) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (currentSection === 'intro') return;

    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -100px 0px',
      threshold: [0.1, 0.3, 0.5]
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          setVisibleSections(prev => new Set([...prev, entry.target.id]));
          setCurrentSection(entry.target.id as Section);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [currentSection]);

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

  if (currentSection === 'intro') {
    return (
      <I18nProvider>
        <div className="size-full">
          <IntroScreen onComplete={handleIntroComplete} />
        </div>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <div className="size-full min-h-screen">
        <ClickRipple />
        <DevProjectsControl />
        <Layout
          currentSection={currentSection}
          onSectionChange={scrollToSection}
        >
          <div ref={sectionsRef} className="relative">
            <section 
              id="about-me" 
              data-section="about-me"
              className="min-h-screen flex items-center justify-center py-20 relative -mt-24 pt-40 scroll-mt-24"
            >
              {/* Gradient overlay with backdrop blur - extends above section to cover navbar area */}
              <div className="absolute -top-24 left-0 right-0 bottom-0 bg-gradient-to-b from-[#f0f6fe]/70 from-0% via-[#f0f6fe]/70 via-30% to-transparent to-100% backdrop-blur-sm pointer-events-none" />
              <div className="relative z-10 w-full">
                <AboutMe isVisible={visibleSections.has('about-me')} />
              </div>
            </section>
            
            <section 
              id="experience" 
              data-section="experience"
              className="min-h-screen flex items-center justify-center py-20 scroll-mt-28"
            >
              <Experience isVisible={visibleSections.has('experience')} />
            </section>
            
            <section 
              id="skills" 
              data-section="skills"
              className="min-h-screen flex items-center justify-center py-20 scroll-mt-28"
            >
              <WhatIBring isVisible={visibleSections.has('skills')} />
            </section>
            
            <section 
              id="projects" 
              data-section="projects"
              className="min-h-screen flex items-center justify-center py-20 scroll-mt-20"
            >
              <Projects isVisible={visibleSections.has('projects')} />
            </section>
            
            <section 
              id="certifications" 
              data-section="certifications"
              className="min-h-screen flex items-center justify-center py-20 scroll-mt-28"
            >
              <Certifications isVisible={visibleSections.has('certifications')} />
            </section>
            
            <section 
              id="contact" 
              data-section="contact"
              className="min-h-screen flex items-center justify-center py-20 scroll-mt-28"
            >
              <Contact isVisible={visibleSections.has('contact')} />
            </section>
          </div>
        </Layout>
      </div>
    </I18nProvider>
  );
}