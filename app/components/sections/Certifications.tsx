import { Award, ChevronDown, ChevronUp, Download, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { useI18n } from '../../contexts/i18nContext';
import { useCertificates } from '../../hooks/useCertificates';
import { EditableText } from '../admin/EditableText';
import { SectionHeader, StaggeredText } from '../animations';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CertificationsProps {
  isVisible: boolean;
}

export const Certifications: React.FC<CertificationsProps> = React.memo(({ isVisible }) => {
  const { t, language } = useI18n() as any;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  // True once the expand animation has fully settled (only one card can be expanded at a time,
  // so a single flag is enough). See the overflow note on the actions container below.
  const [expandSettled, setExpandSettled] = useState(false);
  const { data: certsData } = useCertificates(language);
  const backendCerts = React.useMemo(() => (Array.isArray(certsData) ? certsData : []), [certsData]);
  const [prefixAssets, setPrefixAssets] = useState<Record<string, { images: string[] }>>({});

  // If any certificate declares mediaPrefix, fetch its image list (use first)
  useEffect(() => {
    let cancelled = false;
    async function loadPrefixes() {
      if (!backendCerts || backendCerts.length === 0) return;
      const missing = backendCerts
        .map((c) => c?.mediaPrefix)
        .filter((pfx): pfx is string => !!pfx && !(pfx in prefixAssets));
      if (missing.length === 0) return;
      try {
        const results = await Promise.all(missing.map(async (pfx) => {
          const res = await fetch(`/api/media/by-prefix?prefix=${encodeURIComponent(pfx)}&resourceType=image`);
          if (!res.ok) return [pfx, { images: [] }] as const;
          const data = await res.json();
          const images = Array.isArray(data?.images) ? data.images : [];
          return [pfx, { images }] as const;
        }));
        if (!cancelled) {
          setPrefixAssets((prev) => {
            const next = { ...prev } as typeof prev;
            for (const [pfx, val] of results) next[pfx] = val as any;
            return next;
          });
        }
      } catch {
        // ignore
      }
    }
    loadPrefixes();
    return () => { cancelled = true; };
  }, [backendCerts, prefixAssets]);

  // Fallback from i18n if no dynamic items
  const i18nCerts = t('certifications.items');

  // Normalize data for rendering
  const certifications = (backendCerts && backendCerts.length > 0)
    ? backendCerts.map((c: any) => {
        const title = c.title;
        const description = c.description ?? '';
        const subtitle = c.subtitle ?? '';
        const issuer = c.issuer ?? '';
        const imgByPrefix = c.mediaPrefix ? prefixAssets[c.mediaPrefix]?.images?.[0] : undefined;
        const image = imgByPrefix || c.imageUrl || '';
        return {
          title,
          description,
          subtitle,
          issuer,
          image,
          downloadUrl: c.downloadUrl ?? undefined,
          verifyUrl: c.verifyUrl ?? undefined,
        };
      })
    : i18nCerts;

  const toggleExpand = (index: number) => {
    setExpandSettled(false);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        isVisible={isVisible}
        title={<EditableText path="certifications.title" locale={language} hoverGlow glowColor={[201, 60, 183]} liftOnHover={false}>{t('certifications.title')}</EditableText>}
        subtitle={<EditableText path="certifications.subtitle" locale={language} multiline>{t('certifications.subtitle')}</EditableText>}
      />

      {/* Timeline Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Vertical Line (hidden on mobile) */}
        <motion.div
          initial={{ height: 0 }}
          animate={isVisible ? { height: '100%' } : { height: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="hidden md:block absolute md:left-1/2 top-0 w-1 bg-gradient-to-b from-[#00bfe6] via-[#0096c7] to-[#48cae4] transform md:-translate-x-1/2"
        />

        {/* Certifications */}
        <div className="space-y-12 pt-4">
          {certifications.map((cert: any, index: number) => {
            const isExpanded = expandedIndex === index;
            const hasActions = cert.downloadUrl || cert.verifyUrl;
            
            return (
              <motion.div
                layout
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                transition={{ duration: 0.8, delay: 0.6 + (index * 0.2) }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col gap-8`}
              >
                {/* Timeline Dot (hidden on mobile) */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isVisible ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + (index * 0.2), type: "spring", bounce: 0.5 }}
                  className="hidden md:block absolute md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] rounded-full border-4 border-white shadow-lg z-10"
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
                <div className="w-full md:w-1/2 pl-0">
                  <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00bfe6]/20 to-[#0096c7]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Main Card */}
                    <motion.div
                      layout
                      whileHover={{ y: -5 }}
                      className="relative bg-white/30 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/40 shadow-2xl will-change-transform"
                    >
                      {/* Image: falls back to a branded placeholder instead of an empty `src`,
                          which React warns about and browsers may re-request as the page URL. */}
                      <div className="relative h-48 overflow-hidden">
                        {cert.image ? (
                          <ImageWithFallback
                            src={cert.image}
                            alt={cert.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#00bfe6]/40 to-[#0096c7]/40 flex items-center justify-center">
                            <Award size={48} className="text-white/80" />
                          </div>
                        )}
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
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-2xl font-bold text-gray-900">
                            <StaggeredText text={cert.title} hoverGlow />
                          </h3>
                          {hasActions && (
                            <motion.button
                              onClick={() => toggleExpand(index)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-out"
                            >
                              {isExpanded ? (
                                <ChevronUp size={20} className="text-white" />
                              ) : (
                                <ChevronDown size={20} className="text-white" />
                              )}
                            </motion.button>
                          )}
                        </div>

                        {(cert.subtitle || cert.date) && (
                          <p className="text-sm text-gray-500 mb-4">{cert.subtitle || cert.date}</p>
                        )}

                        {cert.description && (
                          <p className="text-gray-700 leading-relaxed">
                            {cert.description}
                          </p>
                        )}

                        {/* Actions */}
                        {hasActions && (
                          <motion.div
                            layout
                            initial={false}
                            animate={isExpanded ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                            // overflow:hidden is only needed while the height animation is in
                            // flight (it's what clips the sliding content). Left on permanently,
                            // it also clips the Download button's edges whenever its hover scale
                            // (1.05) pushes it past this container's bounds — so once the expand
                            // has fully settled, switch to visible and let the hover zoom breathe.
                            style={{ overflow: isExpanded && expandSettled ? 'visible' : 'hidden' }}
                            onAnimationComplete={() => {
                              if (isExpanded) setExpandSettled(true);
                            }}
                            className="mt-6"
                          >
                            <div className="pt-6 border-t border-gray-300/50 flex flex-wrap gap-3">
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
                                  // No zoom on hover for verify
                                  whileHover={{}}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-white/50 backdrop-blur-sm text-[#00bfe6] font-medium rounded-xl border-2 border-[#00bfe6]/30 hover:bg-[#00bfe6]/10 hover:border-[#00bfe6] transition-all duration-300"
                                >
                                  <ExternalLink size={18} />
                                  {t('certifications.verify')}
                                </motion.a>
                              )}
                            </div>
                          </motion.div>
                        )}
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
        className="text-center mt-24 px-4 sm:px-6"
      >
        <p className="text-2xl text-gray-600 font-light italic">
          {t('certifications.transition')}
        </p>
      </motion.div>
    </div>
  );
});

Certifications.displayName = 'Certifications';
