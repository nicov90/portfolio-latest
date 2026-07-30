import {
  ExternalLink,
  Github,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { useI18n } from '../../contexts/i18nContext';
import { ImageStackCarousel } from '../ImageStackCarousel';
import { SimpleImageCarousel } from '../SimpleImageCarousel';

interface ProjectsProps {
  isVisible: boolean;
}

interface Project {
  title: string;
  description: string;
  tech: string[];
  images: string[];
  demo?: string;
  github?: string;
  video?: string;
}

export const Projects: React.FC<ProjectsProps> = React.memo(({ isVisible }) => {
  const { t, language } = useI18n() as any;
  const [allLocaleProjects, setAllLocaleProjects] = useState<any[] | null>(null);
  const [prefixAssets] = useState<Record<string, { images: string[]; video: string | null }>>({});

  // Render plain text with blank lines as paragraphs and single newlines as line breaks
  const renderDescription = (text?: string) => {
    if (!text) return null;
    const normalized = text.replace(/\r\n/g, '\n');
    const paragraphs = normalized
      .split(/\n\s*\n/g) // split on blank lines
      .map((p) => p.trim())
      .filter(Boolean);
    if (paragraphs.length === 0) return null;
    return (
      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    );
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/projects?allLocales=1`);
        if (!res.ok) return; // fallback to i18n
        const data = await res.json();
        console.log(data)
        if (isMounted) setAllLocaleProjects(Array.isArray(data) ? data : []);
      } catch {
        // ignore, will fallback to i18n
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Cloudinary assets for any project that declares a mediaPrefix
  // useEffect(() => {
  //   let cancelled = false;
  //   async function loadPrefixes() {
  //     if (!allLocaleProjects || allLocaleProjects.length === 0) return;
  //     const missing = allLocaleProjects
  //       .map((p) => p?.mediaPrefix)
  //       .filter((pfx): pfx is string => !!pfx && !(pfx in prefixAssets));
  //     if (missing.length === 0) return;
  //     try {
  //       const results = await Promise.all(
  //         missing.map(async (pfx) => {
  //           const res = await fetch(`/api/media/by-prefix?prefix=${encodeURIComponent(pfx)}`);
  //           if (!res.ok) return [pfx, { images: [], video: null }] as const;
  //           const data = await res.json();
  //           return [pfx, { images: Array.isArray(data.images) ? data.images : [], video: data.video ?? null }] as const;
  //         })
  //       );
  //       if (!cancelled) {
  //         setPrefixAssets((prev) => {
  //           const next = { ...prev } as typeof prev;
  //           for (const [pfx, val] of results) next[pfx] = val as any;
  //           return next;
  //         });
  //       }
  //     } catch {
  //       // ignore individual failures
  //     }
  //   }
  //   loadPrefixes();
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [allLocaleProjects, prefixAssets]);

  // Get projects data with fallback
  let projectsData;
  try {
    projectsData = t('projects.items');
  } catch (error) {
    console.error('Error getting projects data:', error);
    projectsData = [];
  }

  const projectsFromI18n: Project[] = projectsData.map((item: any, index: number) => ({
    title: item?.title || `Project ${index + 1}`,
    description: item?.description || 'No description available',
    tech: index === 0 ? ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'WebSocket', 'AWS'] :
          index === 1 ? ['React', 'Next.js', 'PostgreSQL', 'Node.js', 'WebRTC', 'Socket.io', 'Docker'] :
          ['React', 'TypeScript', 'Next.js', 'Mapbox', 'Prisma', 'AWS S3', 'Stripe'],
    images: [
      index === 0 ? 'https://images.unsplash.com/photo-1634097537825-b446635b2f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW50ZWNoJTIwZGFzaGJvYXJkJTIwdHJhZGluZyUyMGludGVyZmFjZXxlbnwxfHx8fDE3NTk4Mzc3NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080' :
      index === 1 ? 'https://images.unsplash.com/photo-1747224317356-6dd1a4a078fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwbWVkaWNhbCUyMGFwcCUyMGludGVyZmFjZXxlbnwxfHx8fDE3NTk4MTcyMDF8MA&ixlib=rb-4.1.0&q=80&w=1080' :
      'https://images.unsplash.com/flagged/photo-1558954157-aa76c0d246c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyZWFsJTIwZXN0YXRlJTIwcHJvcGVydHklMjBzZWFyY2glMjBwbGF0Zm9ybXxlbnwxfHx8fDE3NTk4Mzc3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1594549208400-128687ad97ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMGNhcnQlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU5NzkzMDA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      index === 0 ? 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBhbmFseXRpY3N8ZW58MXx8fHwxNzU5ODM3NzUyfDA&ixlib=rb-4.1.0&q=80&w=1080' :
      index === 1 ? 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTk4MTcyMDF8MA&ixlib=rb-4.1.0&q=80&w=1080' :
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGludGVyaW9yfGVufDF8fHx8MTc1OTgzNzc1OXww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    video: index === 0 ? 'https://player.vimeo.com/video/example' : undefined,
    github: index < 2 ? 'https://github.com/nicolasportfolio' : undefined,
    demo: index !== 1 ? 'https://demo-projects.nicolasdev.com' : undefined,
  }));

  // Prefer dynamic projects from DB; fallback to i18n
  const projects: Project[] = (allLocaleProjects && allLocaleProjects.length > 0)
    ? allLocaleProjects.map((p: any) => {
        const tr = p?.translations?.[language];
        const base: Project = {
          title: tr?.title ?? p.title,
          description: tr?.description ?? p.description ?? '',
          tech: Array.isArray(p.tech) ? p.tech : [],
          images: Array.isArray(p.images) ? p.images : [],
          demo: p.demoUrl ?? undefined,
          github: p.githubUrl ?? undefined,
          video: p.videoUrl ?? undefined,
        };
        if (p?.mediaPrefix && prefixAssets[p.mediaPrefix]) {
          const assets = prefixAssets[p.mediaPrefix];
          return {
            ...base,
            images: assets.images.length > 0 ? assets.images : base.images,
            video: assets.video ?? base.video,
          };
        }
        return base;
      })
    : projectsFromI18n;

  return (
    <div className="w-full">
      {/* Header - centered with whitespace around */}
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl leading-tight font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6"
          >
            {t('projects.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
          >
            {t('projects.subtitle')}
          </motion.p>
        </div>
      </div>

  {/* Projects */}
      <div className="space-y-0">
        {projects && projects.length > 0 ? projects.map((project, index) => (
          <motion.div
            key={index}
            className="min-h-screen flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full max-w-7xl mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Image Stack Carousel */}
                {/* Desktop/Large screens: 3D stack */}
                <motion.div
                  className="h-[70vh] min-h-[500px] w-[75%] lg:w-full mx-auto hidden md:block"
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  {/* Delay distinto por proyecto */}
                  <ImageStackCarousel images={project.images} autoPlayDelay={4500 + (index % 7) * 600} />
                </motion.div>

                {/* Mobile/Tablet: simple full-image carousel */}
                <motion.div
                  className="block md:hidden"
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <SimpleImageCarousel images={project.images} autoPlayDelay={4500 + (index % 7) * 600} />
                </motion.div>

                {/* Right side - Project Info */}
                <motion.div
                  className="space-y-6 px-4 sm:px-6 md:px-0"
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <div>
                    <h2 className="text-4xl font-bold mb-4">{project.title}</h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] rounded-full mb-6" />
                    {renderDescription(project.description)}
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{t('projects.technologies')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, techIndex) => (
                        <motion.span
                          key={techIndex}
                          className="px-4 py-2 text-sm rounded-full font-semibold shadow-sm bg-white/50 backdrop-blur-xl border border-white/70 text-[#00bfe6]"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Video if available */}
                  {project.video && (
                    <div className="rounded-xl overflow-hidden shadow-xl">
                      <iframe
                        width="100%"
                        height="280"
                        src={project.video}
                        title="Project video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="border-0"
                      />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    {project.demo && (
                      <motion.a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] text-white rounded-lg font-medium shadow-lg"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0, 191, 230, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink className="h-5 w-5" />
                        {t('projects.liveDemo')}
                      </motion.a>
                    )}
                    {project.github && (
                      <motion.a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-white/80 rounded-lg font-medium shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Github className="h-5 w-5" />
                        {t('projects.viewCode')}
                      </motion.a>
                    )}
                    {project.video && (
                      <motion.a
                        href={project.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-white/80 rounded-lg font-medium shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="h-5 w-5" />
                        {t('projects.watchVideo')}
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600 text-lg">No projects available</p>
          </div>
        )}
      </div>
    </div>
  );
});

Projects.displayName = 'Projects';