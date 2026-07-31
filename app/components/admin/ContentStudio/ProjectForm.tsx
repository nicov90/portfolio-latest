"use client";
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateProject, useDeleteProject, useUpdateProject } from '../../../hooks/useProjects';
import { Button } from '../../ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../../ui/drawer';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { ImageManager } from './ImageManager';

const TRANSLATABLE_LOCALES = [
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
] as const;

const schema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  tech: z.string().optional(),
  demoUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  featured: z.boolean(),
  esTitle: z.string().optional(),
  esDescription: z.string().optional(),
  jaTitle: z.string().optional(),
  jaDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export interface ProjectRecord {
  id: number;
  title: string;
  description?: string | null;
  tech?: string[] | null;
  images?: string[] | null;
  demoUrl?: string | null;
  githubUrl?: string | null;
  videoUrl?: string | null;
  featured?: boolean;
  sortOrder?: number | null;
  translations?: Record<string, { title?: string; description?: string }>;
}

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  project?: ProjectRecord | null;
}

const emptyDefaults: FormValues = {
  title: '',
  description: '',
  tech: '',
  demoUrl: '',
  githubUrl: '',
  videoUrl: '',
  featured: false,
  esTitle: '',
  esDescription: '',
  jaTitle: '',
  jaDescription: '',
};

export const ProjectForm: React.FC<ProjectFormProps> = ({ open, onClose, project }) => {
  const isEditing = Boolean(project?.id);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });
  const [images, setImages] = useState<string[]>([]);
  const [translationLocale, setTranslationLocale] = useState<'es' | 'ja'>('es');
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: deleteProject } = useDeleteProject();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (project) {
      reset({
        title: project.title || '',
        description: project.description || '',
        tech: (project.tech || []).join(', '),
        demoUrl: project.demoUrl || '',
        githubUrl: project.githubUrl || '',
        videoUrl: project.videoUrl || '',
        featured: Boolean(project.featured),
        esTitle: project.translations?.es?.title || '',
        esDescription: project.translations?.es?.description || '',
        jaTitle: project.translations?.ja?.title || '',
        jaDescription: project.translations?.ja?.description || '',
      });
      setImages(project.images || []);
    } else {
      reset(emptyDefaults);
      setImages([]);
    }
    setTranslationLocale('es');
    setError(null);
  }, [open, project, reset]);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      const techArr = (data.tech || '').split(',').map((s) => s.trim()).filter(Boolean);
      const payload = {
        title: data.title,
        description: data.description || null,
        tech: techArr,
        images,
        demoUrl: data.demoUrl || null,
        githubUrl: data.githubUrl || null,
        videoUrl: data.videoUrl || null,
        featured: data.featured,
      };
      const translations: Record<string, { title?: string; description?: string }> = {};
      if (data.esTitle || data.esDescription) {
        translations.es = { title: data.esTitle || undefined, description: data.esDescription || undefined };
      }
      if (data.jaTitle || data.jaDescription) {
        translations.ja = { title: data.jaTitle || undefined, description: data.jaDescription || undefined };
      }
      const translationsPayload = Object.keys(translations).length > 0 ? translations : undefined;

      if (isEditing && project) {
        await updateProject({ id: project.id, project: payload, translations: translationsPayload });
      } else {
        await createProject({ project: payload, translations: translationsPayload });
      }
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Error al guardar el proyecto');
    }
  };

  const handleDelete = async () => {
    if (!project?.id) return;
    if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Error al eliminar el proyecto');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="!w-full sm:!max-w-2xl h-full">
        <DrawerHeader>
          <DrawerTitle>{isEditing ? 'Editar proyecto' : 'Nuevo proyecto'}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
            <div className="space-y-2">
              <Label htmlFor="title">Título (EN)</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (EN)</Label>
              <Textarea id="description" rows={5} {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tech">Tecnologías (separadas por coma)</Label>
              <Input id="tech" {...register('tech')} placeholder="React, Node.js, PostgreSQL" />
            </div>

            <div className="space-y-2">
              <Label>Imágenes</Label>
              <ImageManager images={images} onChange={setImages} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demoUrl">Demo URL</Label>
                <Input id="demoUrl" {...register('demoUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input id="githubUrl" {...register('githubUrl')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (embed)</Label>
              <Input id="videoUrl" {...register('videoUrl')} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('featured')} />
              <span className="text-sm">Destacado</span>
            </label>

            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Traducción</h3>
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  {TRANSLATABLE_LOCALES.map((loc) => (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => setTranslationLocale(loc.code)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        translationLocale === loc.code ? 'bg-white shadow text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>
              {translationLocale === 'es' ? (
                <React.Fragment key="es">
                  <Input {...register('esTitle')} placeholder="Título en español" />
                  <Textarea rows={3} {...register('esDescription')} placeholder="Descripción en español" />
                </React.Fragment>
              ) : (
                <React.Fragment key="ja">
                  <Input {...register('jaTitle')} placeholder="タイトル（日本語）" />
                  <Textarea rows={3} {...register('jaDescription')} placeholder="説明（日本語）" />
                </React.Fragment>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              {isEditing ? (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Eliminando…' : 'Eliminar proyecto'}
                </Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando…' : 'Guardar'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
