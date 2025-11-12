import dayjs from 'dayjs';
import { motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../contexts/i18nContext';
import { CreativeRoleCard } from './about/CreativeRoleCard';
import { QuickStats } from './about/QuickStats';

interface AboutMeProps {
  isVisible: boolean;
}

export const AboutMe: React.FC<AboutMeProps> = ({ isVisible }) => {
  const { t } = useI18n();
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
    { value: experienceYearsHalfStep.toFixed(1).replace(/\.0$/, '') + '+', label: t('about.stats.years') },
    { value: effectiveProjects + '+', label: t('about.stats.projects') },
    { value: (certCount ?? 10) + '+', label: t('about.stats.certifications') || 'Certifications' }
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
              {t('about.title')}
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] rounded-full mb-6"></div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-700 leading-relaxed"
          >
            {t('about.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-4"
          >
            <p className="text-gray-600 leading-relaxed">
              {t('about.description')}
            </p>
          </motion.div>

          <QuickStats isVisible={isVisible} stats={stats} />
        </motion.div>

        {/* Right Side - Creative Role Card */}
        <div className="relative">
          <CreativeRoleCard
            isVisible={isVisible}
            title={t('about.mainCard.title')}
            suffix={t('about.mainCard.suffix') || 'Crafting Impactful Solutions'}
            tagline={t('about.mainCard.tagline') || 'Designing, building and refining scalable web experiences with a product mindset and a love for clean code.'}
            chips={[
              t('about.mainCard.pills.frontend') || 'Frontend',
              t('about.mainCard.pills.backend') || 'Backend',
              t('about.mainCard.pills.cloud') || 'Cloud',
              t('about.mainCard.pills.ux') || 'UX',
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
          {t('about.transition')}
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
};