import React from 'react';
import { motion } from 'motion/react';
import { useI18n } from '../../contexts/i18nContext';
import { Sparkles } from 'lucide-react';

interface AboutMeProps {
  isVisible: boolean;
}

export const AboutMe: React.FC<AboutMeProps> = ({ isVisible }) => {
  const { t } = useI18n();

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
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
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

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-3 gap-4 pt-6"
          >
            {[
              { value: '1.5+', label: t('about.stats.years') },
              { value: '10+', label: t('about.stats.projects') },
              { value: '100%', label: t('about.stats.dedication') }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={isVisible ? { scale: 1 } : { scale: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 1 + (index * 0.1),
                  type: "spring",
                  bounce: 0.5
                }}
                className="text-center"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-[#00bfe6] to-[#0096c7] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Interactive Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          {/* Main Circle with Floating Icons */}
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Central Circle */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={isVisible ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
              transition={{ duration: 1, delay: 0.5, type: "spring", bounce: 0.4 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#00bfe6]/20 to-[#0096c7]/20 backdrop-blur-xl border-4 border-[#00bfe6]/30 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <Sparkles size={48} className="text-[#00bfe6] mx-auto mb-2" />
                  <p className="font-bold text-2xl text-gray-800">{t('about.mainCard.title')}</p>
                </div>
              </div>
            </motion.div>


          </div>
        </motion.div>
      </div>

      {/* Section Transition Text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="text-center mb-16"
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