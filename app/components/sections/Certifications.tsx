import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../contexts/i18nContext';
import { Award, Download, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CertificationsProps {
  isVisible: boolean;
}

export const Certifications: React.FC<CertificationsProps> = ({ isVisible }) => {
  const { t } = useI18n();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const certifications = t('certifications.items');

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6"
        >
          {t('certifications.title')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
        >
          {t('certifications.subtitle')}
        </motion.p>
      </motion.div>

      {/* Timeline Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Vertical Line */}
        <motion.div
          initial={{ height: 0 }}
          animate={isVisible ? { height: '100%' } : { height: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute left-8 md:left-1/2 top-0 w-1 bg-gradient-to-b from-[#00bfe6] via-[#0096c7] to-[#48cae4] transform md:-translate-x-1/2"
        />

        {/* Certifications */}
        <div className="space-y-12 pt-4">
          {certifications.map((cert: any, index: number) => {
            const isExpanded = expandedIndex === index;
            const hasActions = cert.downloadUrl || cert.verifyUrl;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                transition={{ duration: 0.8, delay: 0.6 + (index * 0.2) }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col gap-8`}
              >
                {/* Timeline Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isVisible ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + (index * 0.2), type: "spring", bounce: 0.5 }}
                  className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] rounded-full border-4 border-white shadow-lg z-10"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-full h-full rounded-full bg-[#00bfe6]/50"
                  />
                </motion.div>

                {/* Empty space for timeline alignment on desktop */}
                <div className="hidden md:block md:w-1/2" />

                {/* Card Container */}
                <div className="w-full md:w-1/2 pl-20 md:pl-0">
                  <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00bfe6]/20 to-[#0096c7]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Main Card */}
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="relative bg-white/30 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/40 shadow-2xl"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback
                          src={cert.image}
                          alt={cert.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Badge */}
                        <motion.div
                          initial={{ x: -100, opacity: 0 }}
                          animate={isVisible ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
                          transition={{ duration: 0.8, delay: 1 + (index * 0.2) }}
                          className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] rounded-full flex items-center gap-2 shadow-lg"
                        >
                          <Award size={16} className="text-white" />
                          <span className="text-white font-bold text-sm">{cert.issuer}</span>
                        </motion.div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {cert.title}
                          </h3>
                          {hasActions && (
                            <motion.button
                              onClick={() => toggleExpand(index)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-[#00bfe6]/20 rounded-lg hover:bg-[#00bfe6]/30 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp size={20} className="text-[#00bfe6]" />
                              ) : (
                                <ChevronDown size={20} className="text-[#00bfe6]" />
                              )}
                            </motion.button>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4">{cert.date}</p>

                        {cert.description && (
                          <p className="text-gray-700 leading-relaxed">
                            {cert.description}
                          </p>
                        )}

                        {/* Actions */}
                        <AnimatePresence>
                          {isExpanded && hasActions && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-6 pt-6 border-t border-gray-300/50 flex flex-wrap gap-3"
                            >
                              {cert.downloadUrl && (
                                <motion.a
                                  href={cert.downloadUrl}
                                  download
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] text-white font-medium rounded-xl hover:from-[#0096c7] hover:to-[#0077b6] transition-all duration-300 shadow-lg"
                                >
                                  <Download size={18} />
                                  {t('certifications.download')}
                                </motion.a>
                              )}
                              
                              {cert.verifyUrl && (
                                <motion.a
                                  href={cert.verifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-white/50 backdrop-blur-sm text-[#00bfe6] font-medium rounded-xl border-2 border-[#00bfe6]/30 hover:bg-[#00bfe6]/10 hover:border-[#00bfe6] transition-all duration-300"
                                >
                                  <ExternalLink size={18} />
                                  {t('certifications.verify')}
                                </motion.a>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Transition Text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="text-center mt-24"
      >
        <p className="text-2xl text-gray-600 font-light italic">
          {t('certifications.transition')}
        </p>
      </motion.div>
    </div>
  );
};
