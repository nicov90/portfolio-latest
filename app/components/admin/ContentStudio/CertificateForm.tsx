"use client";
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateCertificate, useDeleteCertificate, useUpdateCertificate } from '../../../hooks/useCertificates';
import { Button } from '../../ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../../ui/drawer';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { ImageManager } from './ImageManager';

const schema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  issuer: z.string().optional(),
  verifyUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
  esTitle: z.string().optional(),
  esSubtitle: z.string().optional(),
  esDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export interface CertificateRecord {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  issuer?: string | null;
  imageUrl?: string | null;
  verifyUrl?: string | null;
  downloadUrl?: string | null;
  sortOrder?: number | null;
  translations?: Record<string, { title?: string; subtitle?: string; description?: string }>;
}

interface CertificateFormProps {
  open: boolean;
  onClose: () => void;
  certificate?: CertificateRecord | null;
}

const emptyDefaults: FormValues = {
  title: '',
  subtitle: '',
  description: '',
  issuer: '',
  verifyUrl: '',
  downloadUrl: '',
  esTitle: '',
  esSubtitle: '',
  esDescription: '',
};

export const CertificateForm: React.FC<CertificateFormProps> = ({ open, onClose, certificate }) => {
  const isEditing = Boolean(certificate?.id);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });
  const [images, setImages] = useState<string[]>([]);
  const { mutateAsync: createCertificate } = useCreateCertificate();
  const { mutateAsync: updateCertificate } = useUpdateCertificate();
  const { mutateAsync: deleteCertificate } = useDeleteCertificate();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (certificate) {
      reset({
        title: certificate.title || '',
        subtitle: certificate.subtitle || '',
        description: certificate.description || '',
        issuer: certificate.issuer || '',
        verifyUrl: certificate.verifyUrl || '',
        downloadUrl: certificate.downloadUrl || '',
        esTitle: certificate.translations?.es?.title || '',
        esSubtitle: certificate.translations?.es?.subtitle || '',
        esDescription: certificate.translations?.es?.description || '',
      });
      setImages(certificate.imageUrl ? [certificate.imageUrl] : []);
    } else {
      reset(emptyDefaults);
      setImages([]);
    }
    setError(null);
  }, [open, certificate, reset]);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      const payload = {
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description || null,
        issuer: data.issuer || null,
        imageUrl: images[0] || null,
        verifyUrl: data.verifyUrl || null,
        downloadUrl: data.downloadUrl || null,
      };
      const translations = (data.esTitle || data.esSubtitle || data.esDescription)
        ? { es: { title: data.esTitle || undefined, subtitle: data.esSubtitle || undefined, description: data.esDescription || undefined } }
        : undefined;

      if (isEditing && certificate) {
        await updateCertificate({ id: certificate.id, certificate: payload, translations });
      } else {
        await createCertificate({ certificate: payload, translations });
      }
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Error al guardar el certificado');
    }
  };

  const handleDelete = async () => {
    if (!certificate?.id) return;
    if (!confirm('¿Eliminar este certificado? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    try {
      await deleteCertificate(certificate.id);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Error al eliminar el certificado');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="!w-full sm:!max-w-2xl h-full">
        <DrawerHeader>
          <DrawerTitle>{isEditing ? 'Editar certificado' : 'Nuevo certificado'}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo (fecha, nivel, etc.)</Label>
              <Input id="subtitle" {...register('subtitle')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" rows={4} {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer">Emisor</Label>
              <Input id="issuer" {...register('issuer')} />
            </div>

            <div className="space-y-2">
              <Label>Imagen</Label>
              <ImageManager images={images} onChange={setImages} maxImages={1} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="verifyUrl">Verificación URL</Label>
                <Input id="verifyUrl" {...register('verifyUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downloadUrl">Descarga URL</Label>
                <Input id="downloadUrl" {...register('downloadUrl')} />
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-sm">Traducción (Español)</h3>
              <Input {...register('esTitle')} placeholder="Título en español" />
              <Input {...register('esSubtitle')} placeholder="Subtítulo en español" />
              <Textarea rows={3} {...register('esDescription')} placeholder="Descripción en español" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              {isEditing ? (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Eliminando…' : 'Eliminar certificado'}
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
