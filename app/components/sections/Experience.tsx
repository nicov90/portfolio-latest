import { Award, Building, Calendar, MapPin, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { useEditMode } from '../../contexts/editModeContext';
import { useI18n } from '../../contexts/i18nContext';
import { useCreateExperienceItem, useDeleteExperienceItem, useExperienceItems, useUpdateExperienceItem } from '../../hooks/useExperience';
import { useAnimEnabled } from '../../lib/animationFlags';
import { EditableList } from '../admin/EditableList';
import { EditableText } from '../admin/EditableText';
import { SectionHeader } from '../animations';

interface ExperienceProps {
  isVisible: boolean;
}

interface NormalizedExperience {
  id: number | null;
  position: string;
  company: string;
  duration: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

const BASE_LOCALE = 'en';

export const Experience: React.FC<ExperienceProps> = React.memo(({ isVisible }) => {
  const { t, language } = useI18n();
  const { isAdmin, editMode } = useEditMode();
  const cardsAnimated = useAnimEnabled('cardEntrances');
  const microAnimated = useAnimEnabled('microInteractions');
  const entranceTransition = (base: object) => (cardsAnimated ? base : { duration: 0 });
  const microTransition = (base: object) => (microAnimated ? base : { duration: 0 });
  const { data } = useExperienceItems();
  const { mutate: updateItem } = useUpdateExperienceItem();
  const { mutate: createItem, isPending: creating } = useCreateExperienceItem();
  const { mutate: deleteItem } = useDeleteExperienceItem();

  const dbItems: any[] = Array.isArray(data) ? data : [];
  const usingDb = dbItems.length > 0;

  const experiences: NormalizedExperience[] = usingDb
    ? dbItems.map((item) => {
        const tr = item.translations?.[language];
        return {
          id: item.id,
          position: tr?.position ?? item.position,
          company: tr?.company ?? item.company,
          duration: tr?.duration ?? item.duration ?? '',
          location: tr?.location ?? item.location ?? '',
          description: tr?.description ?? item.description ?? '',
          achievements: tr?.achievements ?? item.achievements ?? [],
          technologies: tr?.technologies ?? item.technologies ?? [],
        };
      })
    : (t('experience.items') as any[]).map((exp) => ({ ...exp, id: null }));

  // Saves a single field for a given experience item, targeting the base row (EN)
  // or that locale's translation row, matching the currently selected language.
  const saveField = (id: number, field: string, value: string | string[]) => {
    if (language === BASE_LOCALE) {
      updateItem({ id, item: { [field]: value } });
    } else {
      updateItem({ id, translations: { [language]: { [field]: value } } });
    }
  };

  const handleAdd = () => {
    createItem({
      item: {
        position: 'Nuevo puesto',
        company: 'Nueva empresa',
        duration: '',
        location: '',
        description: '',
        achievements: [],
        technologies: [],
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('¿Eliminar esta experiencia?')) return;
    deleteItem(id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        isVisible={isVisible}
        title={<EditableText path="experience.title" locale={language} hoverGlow glowColor={[201, 60, 183]} liftOnHover={false}>{t('experience.title')}</EditableText>}
        subtitle={<EditableText path="experience.subtitle" locale={language} multiline>{t('experience.subtitle')}</EditableText>}
      />

      {/* Timeline Container */}
      <div className="relative">
        {/* Timeline Line (hidden on mobile) */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isVisible ? { scaleY: 1 } : { scaleY: 0 }}
          transition={entranceTransition({ duration: 1.5, delay: 0.6 })}
          className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"
          style={{ height: '100%', transformOrigin: 'top' }}
        />

        {/* Experience Items */}
        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id ?? index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              transition={entranceTransition({ duration: 0.8, delay: 0.8 + (index * 0.2) })}
              className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
            >
              {/* Timeline Dot (hidden on mobile) */}
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={isVisible ? { scale: 1, rotate: 360 } : { scale: 0, rotate: 0 }}
                transition={entranceTransition({ duration: 0.8, delay: 1 + (index * 0.2), type: "spring", bounce: 0.4 })}
                className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg z-10"
              >
                {index === 0 && (
                  <motion.div
                    animate={microAnimated ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                    transition={microTransition({ duration: 2, repeat: Infinity })}
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
                    {isAdmin && editMode && exp.id != null && experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDelete(exp.id as number)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                        title="Eliminar experiencia"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <motion.h3
                          initial={{ opacity: 0, y: 20 }}
                          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          transition={entranceTransition({ duration: 0.6, delay: 1.2 + (index * 0.2) })}
                          className="text-2xl font-bold text-gray-800 mb-2"
                        >
                          <EditableText
                            locale={language}
                            onSave={exp.id != null ? (v) => saveField(exp.id as number, 'position', v) : undefined}
                          >
                            {exp.position}
                          </EditableText>
                        </motion.h3>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={entranceTransition({ duration: 0.6, delay: 1.4 + (index * 0.2) })}
                          className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-1"
                        >
                          <Building size={18} className="text-blue-500" />
                          <EditableText
                            locale={language}
                            onSave={exp.id != null ? (v) => saveField(exp.id as number, 'company', v) : undefined}
                          >
                            {exp.company}
                          </EditableText>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={entranceTransition({ duration: 0.6, delay: 1.6 + (index * 0.2) })}
                          className="flex flex-wrap gap-4 text-sm text-gray-600"
                        >
                          <div className="flex items-center gap-1">
                            <Calendar size={16} className="text-purple-500" />
                            <EditableText
                              locale={language}
                              onSave={exp.id != null ? (v) => saveField(exp.id as number, 'duration', v) : undefined}
                            >
                              {exp.duration}
                            </EditableText>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={16} className="text-pink-500" />
                            <EditableText
                              locale={language}
                              onSave={exp.id != null ? (v) => saveField(exp.id as number, 'location', v) : undefined}
                            >
                              {exp.location}
                            </EditableText>
                          </div>
                        </motion.div>
                      </div>

                      {index === 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={isVisible ? { scale: 1 } : { scale: 0 }}
                          transition={entranceTransition({ duration: 0.5, delay: 1.8 + (index * 0.2) })}
                          className="ml-1 mt-1 whitespace-nowrap shrink-0 px-3 py-1 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] text-white text-xs font-semibold rounded-full"
                        >
                          <EditableText path="experience.current" locale={language}>{t('experience.current')}</EditableText>
                        </motion.div>
                      )}
                    </div>

                    {/* Description: an accented "pull quote" block rather than plain running text,
                        so it reads as a distinct highlight instead of blending into the card. */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={entranceTransition({ duration: 0.6, delay: 2 + (index * 0.2) })}
                      className="mb-6 pl-4 py-0.5 border-l-2 border-[#00bfe6]/40"
                    >
                      <p className="text-gray-700 leading-relaxed italic">
                        <EditableText
                          locale={language}
                          multiline
                          onSave={exp.id != null ? (v) => saveField(exp.id as number, 'description', v) : undefined}
                        >
                          {exp.description}
                        </EditableText>
                      </p>
                    </motion.div>

                    {/* Achievements: nested in their own inner panel so they read as a distinct
                        sub-block of the card instead of floating loose on the card background. */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={entranceTransition({ duration: 0.6, delay: 2.2 + (index * 0.2) })}
                      className="mb-6 rounded-2xl bg-white/30 border border-white/40 p-4 sm:p-5"
                    >
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Award size={18} className="text-yellow-500" />
                        <EditableText path="experience.achievements" locale={language}>{t('experience.achievements')}</EditableText>
                      </h4>
                      <EditableList
                        locale={language}
                        items={exp.achievements}
                        onSave={exp.id != null ? (v) => saveField(exp.id as number, 'achievements', v) : undefined}
                      >
                        {(achievements) => (
                          <ul className="space-y-2">
                            {achievements.map((achievement: string, achIndex: number) => (
                              <motion.li
                                key={achIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                transition={entranceTransition({ duration: 0.4, delay: 2.4 + (index * 0.2) + (achIndex * 0.1) })}
                                className="flex items-start gap-2 text-[15px] text-gray-600 leading-relaxed"
                              >
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                {achievement}
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </EditableList>
                    </motion.div>

                    {/* Technologies */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={entranceTransition({ duration: 0.6, delay: 2.6 + (index * 0.2) })}
                    >
                      <h4 className="font-semibold text-gray-800 mb-3">
                        <EditableText path="experience.technologies" locale={language}>{t('experience.technologies')}</EditableText>
                      </h4>
                      <EditableList
                        locale={language}
                        items={exp.technologies}
                        onSave={exp.id != null ? (v) => saveField(exp.id as number, 'technologies', v) : undefined}
                      >
                        {(technologies) => (
                          <div className="flex flex-wrap gap-2">
                            {technologies.map((tech: string, techIndex: number) => (
                              <motion.span
                                key={techIndex}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                                transition={entranceTransition({
                                  duration: 0.4,
                                  delay: 2.8 + (index * 0.2) + (techIndex * 0.05),
                                  type: "spring",
                                  bounce: 0.4
                                })}
                                whileHover={{ scale: 1.1 }}
                                className="px-3 py-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 text-sm rounded-full font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                              >
                                {tech}
                              </motion.span>
                            ))}
                          </div>
                        )}
                      </EditableList>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {isAdmin && editMode && usingDb && (
        <div className="flex justify-center mt-12">
          <button
            type="button"
            onClick={handleAdd}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00bfe6] to-[#0096c7] text-white font-medium shadow-lg disabled:opacity-60"
          >
            <Plus size={18} />
            {creating ? 'Agregando…' : 'Agregar experiencia'}
          </button>
        </div>
      )}
    </div>
  );
});

Experience.displayName = 'Experience';
