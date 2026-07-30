import {
  ArrowRight,
  Blocks,
  Palette,
  Shield,
  Smartphone,
  Users,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { EditableText } from '../admin/EditableText';
import { useI18n } from '../../contexts/i18nContext';

interface WhatIBringProps {
  isVisible: boolean;
}

export const WhatIBring: React.FC<WhatIBringProps> = React.memo(({ isVisible }) => {
  const { t, language } = useI18n();

  const services = [
    {
      icon: Blocks,
      key: 'fullstack',
      title: t('whatIBring.services.fullstack.title'),
      description: t('whatIBring.services.fullstack.description'),
      gradient: 'from-[#00bfe6] to-[#0096c7]'
    },
    {
      icon: Smartphone,
      key: 'mobile',
      title: t('whatIBring.services.mobile.title'),
      description: t('whatIBring.services.mobile.description'),
      gradient: 'from-[#0096c7] to-[#0077b6]'
    },
    {
      icon: Palette,
      key: 'design',
      title: t('whatIBring.services.design.title'),
      description: t('whatIBring.services.design.description'),
      gradient: 'from-[#00bfe6] to-[#48cae4]'
    },
    {
      icon: Zap,
      key: 'performance',
      title: t('whatIBring.services.performance.title'),
      description: t('whatIBring.services.performance.description'),
      gradient: 'from-[#0096c7] to-[#00bfe6]'
    },
    {
      icon: Shield,
      key: 'security',
      title: t('whatIBring.services.security.title'),
      description: t('whatIBring.services.security.description'),
      gradient: 'from-[#0077b6] to-[#0096c7]'
    },
    {
      icon: Users,
      key: 'collaboration',
      title: t('whatIBring.services.collaboration.title'),
      description: t('whatIBring.services.collaboration.description'),
      gradient: 'from-[#48cae4] to-[#00bfe6]'
    }
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl leading-tight font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6"
          >
            <EditableText path="whatIBring.title" locale={language}>{t('whatIBring.title')}</EditableText>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
          >
            <EditableText path="whatIBring.subtitle" locale={language} multiline>{t('whatIBring.subtitle')}</EditableText>
          </motion.p>
          
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-1 w-32 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] rounded-full mx-auto mt-8"
          />
        </motion.div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{
                  duration: 0.7,
                  delay: 0.8 + (index * 0.12),
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3, ease: 'easeOut' }
                }}
                className="group relative"
              >
                {/* Glow Effect */}
                <motion.div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${service.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                />
                
                {/* Card */}
                <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-[#00bfe6]/20 shadow-lg group-hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Icon: idle float loop, independent of hover, so the card has a little life at rest */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.2 + (index % 3) * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
                    whileHover={{ scale: 1.08, rotate: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
                    className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon size={32} className="text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    <EditableText path={`whatIBring.services.${service.key}.title`} locale={language}>{service.title}</EditableText>
                  </h3>
                  <div className={`h-0.5 w-10 bg-gradient-to-r ${service.gradient} rounded-full mb-4 origin-left scale-x-100 group-hover:w-16 transition-all duration-300`} />

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    <EditableText path={`whatIBring.services.${service.key}.description`} locale={language} multiline>{service.description}</EditableText>
                  </p>

                  {/* Hover Arrow */}
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-2 text-[#00bfe6] font-semibold"
                  >
                    <span className="text-sm"><EditableText path="whatIBring.learnMore" locale={language}>{t('whatIBring.learnMore')}</EditableText></span>
                    <ArrowRight size={16} />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Section Transition */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="text-center mt-32 px-4 sm:px-6"
      >
        <p className="text-2xl text-gray-500 italic">
          <EditableText path="whatIBring.transition" locale={language}>{t('whatIBring.transition')}</EditableText>
        </p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="h-0.5 w-48 bg-gradient-to-r from-transparent via-[#00bfe6] to-transparent mx-auto mt-4"
        />
      </motion.div>
    </div>
  );
});

WhatIBring.displayName = 'WhatIBring';