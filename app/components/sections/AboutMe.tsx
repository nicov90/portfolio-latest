import dayjs from 'dayjs';
import { motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import { EditableText } from '../admin/EditableText';
import { useI18n } from '../../contexts/i18nContext';
import { CreativeRoleCard } from './about/CreativeRoleCard';
import { QuickStats } from './about/QuickStats';

interface AboutMeProps {
  isVisible: boolean;
}

export const AboutMe: React.FC<AboutMeProps> = React.memo(({ isVisible }) => {
  const { t, language } = useI18n();
  const startedDate = useMemo(() => new Date('2023-07-01'), []);
  // Experience in 0.5 increments
  const experienceYearsHalfStep = useMemo(() => {
    const months = dayjs().diff(startedDate, 'month');
    const years = months / 12;
    return (Math.round(years * 2) / 2); // nearest 0.5
  }, [startedDate]);

  // Dynamic project count from API (fallback to translation length)
  const [projectCount, setProjectCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/projects/count');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.count === 'number') setProjectCount(data.count);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const fallbackProjects = t('projects.items').length;
  const effectiveProjects = projectCount ?? fallbackProjects;

  // Placeholder for certifications count (could be dynamic similar to projects)
  const [certCount, setCertCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/certificates?count=1');
        if (!res.ok) return;
        const data = await res.json();
        // If endpoint returns array, derive length; else expect {count}
        const c = Array.isArray(data) ? data.length : (typeof data.count === 'number' ? data.count : null);
        if (!cancelled && typeof c === 'number') setCertCount(c);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    {
      value: experienceYearsHalfStep.toFixed(1).replace(/\.0$/, '') + '+',
      label: <EditableText path="about.stats.years" locale={language}>{t('about.stats.years')}</EditableText>,
    },
    {
      value: effectiveProjects + '+',
      label: <EditableText path="about.stats.projects" locale={language}>{t('about.stats.projects')}</EditableText>,
    },
    {
      value: (certCount ?? 10) + '+',
      label: <EditableText path="about.stats.certifications" locale={language}>{t('about.stats.certifications') || 'Certifications'}</EditableText>,
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Main Hero Section */}
      <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
        {/* Left Side - Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
              <EditableText path="about.title" locale={language}>{t('about.title')}</EditableText>
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] rounded-full mb-6"></div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-700 leading-relaxed"
          >
            <EditableText path="about.subtitle" locale={language} multiline>{t('about.subtitle')}</EditableText>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-4"
          >
            <p className="text-gray-600 leading-relaxed">
              <EditableText path="about.description" locale={language} multiline>{t('about.description')}</EditableText>
            </p>
          </motion.div>

          <QuickStats isVisible={isVisible} stats={stats} />
        </motion.div>

        {/* Right Side - Creative Role Card */}
        <div className="relative">
          <CreativeRoleCard
            isVisible={isVisible}
            title={<EditableText path="about.mainCard.title" locale={language}>{t('about.mainCard.title')}</EditableText>}
            suffix={<EditableText path="about.mainCard.suffix" locale={language}>{t('about.mainCard.suffix') || 'Crafting Impactful Solutions'}</EditableText>}
            tagline={<EditableText path="about.mainCard.tagline" locale={language} multiline>{t('about.mainCard.tagline') || 'Designing, building and refining scalable web experiences with a product mindset and a love for clean code.'}</EditableText>}
            chips={[
              <EditableText key="frontend" path="about.mainCard.pills.frontend" locale={language}>{t('about.mainCard.pills.frontend') || 'Frontend'}</EditableText>,
              <EditableText key="backend" path="about.mainCard.pills.backend" locale={language}>{t('about.mainCard.pills.backend') || 'Backend'}</EditableText>,
              <EditableText key="cloud" path="about.mainCard.pills.cloud" locale={language}>{t('about.mainCard.pills.cloud') || 'Cloud'}</EditableText>,
              <EditableText key="ux" path="about.mainCard.pills.ux" locale={language}>{t('about.mainCard.pills.ux') || 'UX'}</EditableText>,
            ]}
          />
        </div>
      </div>

      {/* Section Transition Text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="text-center mb-16 px-4 sm:px-6"
      >
        <p className="text-2xl text-gray-500 italic">
          <EditableText path="about.transition" locale={language}>{t('about.transition')}</EditableText>
        </p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="h-0.5 w-48 bg-gradient-to-r from-transparent via-[#00bfe6] to-transparent mx-auto mt-4"
        />
      </motion.div>
    </div>
  );
});

AboutMe.displayName = 'AboutMe';