import { Award, Building, Calendar, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { useI18n } from '../../contexts/i18nContext';

interface ExperienceProps {
  isVisible: boolean;
}

export const Experience: React.FC<ExperienceProps> = ({ isVisible }) => {
  const { t } = useI18n();

  const experiences = t('experience.items') as any[];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl leading-tight font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6"
        >
          {t('experience.title')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
        >
          {t('experience.subtitle')}
        </motion.p>
      </motion.div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Timeline Line (hidden on mobile) */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isVisible ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"
          style={{ height: '100%', transformOrigin: 'top' }}
        />

        {/* Experience Items */}
        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              transition={{ duration: 0.8, delay: 0.8 + (index * 0.2) }}
              className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
            >
              {/* Timeline Dot (hidden on mobile) */}
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={isVisible ? { scale: 1, rotate: 360 } : { scale: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 1 + (index * 0.2), type: "spring", bounce: 0.4 }}
                className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg z-10"
              >
                {index === 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-50"
                  />
                )}
              </motion.div>

              {/* Content Card */}
              <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white/25 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <motion.h3
                          initial={{ opacity: 0, y: 20 }}
                          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          transition={{ duration: 0.6, delay: 1.2 + (index * 0.2) }}
                          className="text-2xl font-bold text-gray-800 mb-2"
                        >
                          {exp.position}
                        </motion.h3>
                        
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.6, delay: 1.4 + (index * 0.2) }}
                          className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-1"
                        >
                          <Building size={18} className="text-blue-500" />
                          {exp.company}
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.6, delay: 1.6 + (index * 0.2) }}
                          className="flex flex-wrap gap-4 text-sm text-gray-600"
                        >
                          <div className="flex items-center gap-1">
                            <Calendar size={16} className="text-purple-500" />
                            {exp.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={16} className="text-pink-500" />
                            {exp.location}
                          </div>
                        </motion.div>
                      </div>
                      
                      {index === 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={isVisible ? { scale: 1 } : { scale: 0 }}
                          transition={{ duration: 0.5, delay: 1.8 + (index * 0.2) }}
                          className="px-3 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-semibold rounded-full"
                        >
                          {t('experience.current')}
                        </motion.div>
                      )}
                    </div>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 2 + (index * 0.2) }}
                      className="text-gray-700 mb-6 leading-relaxed"
                    >
                      {exp.description}
                    </motion.p>

                    {/* Achievements */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 2.2 + (index * 0.2) }}
                      className="mb-6"
                    >
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Award size={18} className="text-yellow-500" />
                        {t('experience.achievements')}
                      </h4>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement: string, achIndex: number) => (
                          <motion.li
                            key={achIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, delay: 2.4 + (index * 0.2) + (achIndex * 0.1) }}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            {achievement}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Technologies */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 2.6 + (index * 0.2) }}
                    >
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {t('experience.technologies')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech: string, techIndex: number) => (
                          <motion.span
                            key={techIndex}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: 2.8 + (index * 0.2) + (techIndex * 0.05),
                              type: "spring",
                              bounce: 0.4
                            }}
                            whileHover={{ scale: 1.1 }}
                            className="px-3 py-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 text-sm rounded-full font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};