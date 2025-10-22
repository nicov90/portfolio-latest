"use client";
import React, { useMemo, useState } from 'react';

type TranslationFields = {
  title?: string;
  description?: string;
};

type ProjectForm = {
  title: string;
  description?: string;
  tech: string; // comma separated in UI
  demoUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  featured: boolean;
  sortOrder: number;
  images: { file?: File; url?: string }[];
  videos: { file?: File; url?: string }[];
  translations: Record<string, TranslationFields>;
};

async function uploadToCloudinary(file: File, resourceType: 'image' | 'video' | 'auto' = 'auto') {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('resourceType', resourceType);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export const DevProjectsControl: React.FC = () => {
  const isDev = useMemo(() => process.env.NODE_ENV === 'development', []);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<ProjectForm>({
    title: '',
    description: '',
    tech: '',
    demoUrl: '',
    githubUrl: '',
    videoUrl: '',
    featured: false,
    sortOrder: 0,
    images: [],
    videos: [],
    translations: { es: {}, en: {} },
  });

  if (!isDev) return null;

  const addLocale = (locale: string) => {
    setForm((f) => ({
      ...f,
      translations: { ...f.translations, [locale]: f.translations[locale] || {} },
    }));
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!files) return;
    setLoading(true); setError(null); setSuccess(null);
    try {
      const uploads = await Promise.all(Array.from(files).map((file) => uploadToCloudinary(file, 'image')));
      setForm((f) => ({ ...f, images: [...f.images, ...uploads.map((u) => ({ url: u.url }))] }));
    } catch (e: any) {
      setError(e?.message || 'Error uploading images');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideos = async (files: FileList | null) => {
    if (!files) return;
    setLoading(true); setError(null); setSuccess(null);
    try {
      const uploads = await Promise.all(Array.from(files).map((file) => uploadToCloudinary(file, 'video')));
      setForm((f) => ({ ...f, videos: [...f.videos, ...uploads.map((u) => ({ url: u.url }))] }));
    } catch (e: any) {
      setError(e?.message || 'Error uploading videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null);
      const techArr = form.tech.split(',').map(s => s.trim()).filter(Boolean);
      const images = form.images.map(i => i.url).filter(Boolean) as string[];
      const videos = form.videos.map(v => v.url).filter(Boolean) as string[];

      const project = {
        title: form.title,
        description: form.description || null,
        tech: techArr,
        images,
        videoUrl: videos[0] || null,
        demoUrl: form.demoUrl || null,
        githubUrl: form.githubUrl || null,
        featured: form.featured,
        sortOrder: form.sortOrder,
      };

      const translations: Record<string, { title?: string; description?: string }> = {};
      for (const [locale, t] of Object.entries(form.translations)) {
        const title = t.title?.trim();
        const description = t.description?.trim();
        if (title || description) {
          translations[locale] = {
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
          };
        }
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, translations }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      setSuccess('Proyecto creado');
      setForm((f) => ({ ...f, title: '', description: '', tech: '', images: [], videos: [] }));
    } catch (e: any) {
      setError(e?.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating dev button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[998] rounded-full h-12 w-12 flex items-center justify-center shadow-lg bg-gradient-to-r from-[#00bfe6] to-[#0096c7] text-white"
        title="Nuevo Proyecto (Dev)"
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Nuevo Proyecto (Dev)</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500">✕</button>
            </div>

            {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
            {success && <div className="mb-3 text-green-600 text-sm">{success}</div>}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium">Título (base)</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Tecnologías (separadas por coma)</label>
                <input value={form.tech} onChange={e => setForm({ ...form, tech: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Demo URL</label>
                  <input value={form.demoUrl} onChange={e => setForm({ ...form, demoUrl: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">GitHub URL</label>
                  <input value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Orden</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Destacado
                </label>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium">Imágenes</label>
                <input type="file" accept="image/*" multiple onChange={e => handleUploadImages(e.target.files)} />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {form.images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img.url} alt="uploaded" className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm font-medium">Video</label>
                <input type="file" accept="video/*" onChange={e => handleUploadVideos(e.target.files)} />
                <div className="text-xs text-gray-500 mt-1">Se usará el primero como videoUrl</div>
              </div>

              {/* Translations (title + description) */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Traducciones</h3>
                  <button className="text-sm text-blue-600" onClick={() => {
                    const code = prompt('Código de idioma (ej: es, en, pt, fr)');
                    if (code) addLocale(code.toLowerCase());
                  }}>+ Añadir idioma</button>
                </div>
                {Object.entries(form.translations).map(([locale, t]) => (
                  <div key={locale} className="border rounded p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{locale.toUpperCase()}</div>
                      <button className="text-xs text-red-600" onClick={() => {
                        const rest = Object.fromEntries(Object.entries(form.translations).filter(([l]) => l !== locale));
                        setForm({ ...form, translations: rest });
                      }}>Quitar</button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <input placeholder="Título" value={t.title || ''} onChange={e => setForm({ ...form, translations: { ...form.translations, [locale]: { ...t, title: e.target.value } } })} className="w-full border rounded px-3 py-2" />
                      <textarea placeholder="Descripción" value={t.description || ''} onChange={e => setForm({ ...form, translations: { ...form.translations, [locale]: { ...t, description: e.target.value } } })} className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button onClick={() => setOpen(false)} className="px-4 py-2 rounded border">Cancelar</button>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded bg-gradient-to-r from-[#00bfe6] to-[#0096c7] text-white disabled:opacity-60">
                  {loading ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
