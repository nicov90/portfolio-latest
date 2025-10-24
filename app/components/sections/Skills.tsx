import {
    Cloud,
    Code2,
    Cpu,
    Database,
    GitBranch,
    Globe,
    Layers,
    Palette
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { useI18n } from '../../contexts/i18nContext';

interface SkillsProps {
  isVisible: boolean;
}

export const Skills: React.FC<SkillsProps> = ({ isVisible }) => {
  const { t } = useI18n();

  const skillsData = t('skills.categories') as any;
  
  const skillCategories = [
    {
      icon: Code2,
      title: skillsData.frontend.title,
      color: 'from-blue-500 to-cyan-500',
      skills: skillsData.frontend.items
    },
    {
      icon: Database,
      title: skillsData.backend.title,
      color: 'from-green-500 to-emerald-500',
      skills: skillsData.backend.items
    },

    {
      icon: Cloud,
      title: skillsData.tools.title,
      color: 'from-orange-500 to-red-500',
      skills: skillsData.tools.items
    }
  ];

  const tools = [
    { name: 'VS Code', icon: Code2 },
    { name: 'Figma', icon: Palette },
    { name: 'Git', icon: GitBranch },
    { name: 'Postman', icon: Globe },
    { name: 'Slack', icon: Layers },
    { name: 'Notion', icon: Cpu }
  ];

  const getLevelColor = (proficiency: number) => {
    if (proficiency >= 90) return 'from-green-400 to-green-600';
    if (proficiency >= 80) return 'from-blue-400 to-blue-600';
    if (proficiency >= 70) return 'from-yellow-400 to-yellow-600';
    return 'from-gray-400 to-gray-600';
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
          className="text-4xl sm:text-5xl md:text-6xl leading-tight font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6"
        >
          {t('skills.title')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
        >
          {t('skills.subtitle')}
        </motion.p>
      </motion.div>

      {/* Skills Categories */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {skillCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              animate={isVisible ? { 
                opacity: 1, 
                y: 0, 
                rotateX: 0 
              } : { 
                opacity: 0, 
                y: 50, 
                rotateX: 45 
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.6 + (categoryIndex * 0.2),
                type: "spring",
                bounce: 0.4
              }}
              whileHover={{ y: -10 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-20 rounded-3xl blur-xl group-hover:opacity-30 transition-opacity duration-300`}></div>
              <div className="relative bg-white/25 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <Icon size={32} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {category.title}
                  </h3>
                </div>

                {/* Skills List */}
                <div className="space-y-4">
                  {category.skills.map((skill: { name: string; proficiency: number }, skillIndex: number) => (
                    <motion.div
                      key={skillIndex}
                      initial={{ opacity: 0, x: -50 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.8 + (categoryIndex * 0.2) + (skillIndex * 0.1) 
                      }}
                      className="flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-800">{skill.name}</span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={isVisible ? { scale: 1 } : { scale: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 1 + (categoryIndex * 0.2) + (skillIndex * 0.1),
                          type: "spring",
                          bounce: 0.6
                        }}
                        className={`px-3 py-1 bg-gradient-to-r ${getLevelColor(skill.proficiency)} text-white text-sm font-semibold rounded-full shadow-lg`}
                      >
                        {skill.proficiency}%
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tools Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/25 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="text-center mb-8"
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Herramientas
            </h3>
            <p className="text-lg text-gray-700">
              Herramientas que uso en mi día a día
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isVisible ? { 
                    opacity: 1, 
                    scale: 1
                  } : { 
                    opacity: 0, 
                    scale: 0
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 1.6 + (index * 0.1),
                    type: "spring",
                    bounce: 0.5
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    y: -5 
                  }}
                  className="flex flex-col items-center gap-3 p-4 bg-white/20 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center">
                    {tool.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>


    </div>
  );
};