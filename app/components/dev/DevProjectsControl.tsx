"use client";
import React, { useMemo, useRef, useState } from 'react';

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

  // Upload limits
  const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
  const VIDEO_MAX_BYTES = 100 * 1024 * 1024; // 100 MB

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

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
    // Base fields are EN. Provide only non-EN locales here.
    translations: { es: {} },
  });

  // Allow external trigger: dispatch `open-dev-projects` on window to open the modal
  React.useEffect(() => {
    const handler = () => setOpen(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('open-dev-projects', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-dev-projects', handler as EventListener);
      }
    };
  }, []);

  if (!isDev) return null;

  const addLocale = (locale: string) => {
    const code = locale.toLowerCase();
    if (code === 'en') return; // base is EN; avoid duplicate
    setForm((f) => ({
      ...f,
      translations: { ...f.translations, [code]: f.translations[code] || {} },
    }));
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!files) return;
    setLoading(true); setError(null); setSuccess(null);
    try {
      const fileArr = Array.from(files);
      const rejected: string[] = [];
      const accepted = fileArr.filter((file) => {
        const isImage = file.type?.startsWith('image/');
        const okSize = file.size <= IMAGE_MAX_BYTES;
        if (!isImage) rejected.push(`${file.name} (tipo inválido)`);
        else if (!okSize) rejected.push(`${file.name} (${formatBytes(file.size)} > 10 MB)`);
        return isImage && okSize;
      });
      if (accepted.length === 0) {
        setError(`No se subieron imágenes. ${rejected.length ? `Omitidas: ${rejected.join(', ')}` : ''}`.trim());
        return;
      }
      const uploads = await Promise.all(accepted.map((file) => uploadToCloudinary(file, 'image')));
      setForm((f) => ({ ...f, images: [...f.images, ...uploads.map((u) => ({ url: u.url }))] }));
      if (rejected.length) setSuccess(`Imágenes subidas: ${uploads.length}. Omitidas: ${rejected.join(', ')}`);
      else setSuccess(`Imágenes subidas: ${uploads.length}.`);
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
      const fileArr = Array.from(files);
      const rejected: string[] = [];
      const accepted = fileArr.filter((file) => {
        const isVideo = file.type?.startsWith('video/');
        const okSize = file.size <= VIDEO_MAX_BYTES;
        if (!isVideo) rejected.push(`${file.name} (tipo inválido)`);
        else if (!okSize) rejected.push(`${file.name} (${formatBytes(file.size)} > 100 MB)`);
        return isVideo && okSize;
      });
      if (accepted.length === 0) {
        setError(`No se subieron videos. ${rejected.length ? `Omitidos: ${rejected.join(', ')}` : ''}`.trim());
        return;
      }
      const uploads = await Promise.all(accepted.map((file) => uploadToCloudinary(file, 'video')));
      setForm((f) => ({ ...f, videos: [...f.videos, ...uploads.map((u) => ({ url: u.url }))] }));
      if (rejected.length) setSuccess(`Videos subidos: ${uploads.length}. Omitidos: ${rejected.join(', ')}`);
      else setSuccess(`Videos subidos: ${uploads.length}.`);
    } catch (e: any) {
      setError(e?.message || 'Error uploading videos');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const removeVideo = (index: number) => {
    setForm((f) => ({ ...f, videos: f.videos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null);
      if (!form.title.trim()) {
        setError('El título es obligatorio');
        return;
      }
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
                <label className="block text-sm font-medium">Título (base, EN)</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Descripción (base, EN)</label>
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
                <label className="block text-sm font-medium mb-1">Imágenes</label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleUploadImages(e.dataTransfer.files); }}
                >
                  <p className="text-sm text-gray-600">Arrastra y suelta aquí, o haz clic para seleccionar</p>
                  <p className="text-xs text-gray-500 mt-1">Formatos: PNG/JPG • Tamaño máx: 10 MB por imagen</p>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => handleUploadImages(e.target.files)}
                  />
                </div>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="uploaded" className="w-40 h-40 object-cover rounded-lg shadow" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full h-7 w-7 hidden group-hover:flex items-center justify-center"
                          onClick={() => removeImage(i)}
                          title="Quitar imagen"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm font-medium mb-1">Video</label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleUploadVideos(e.dataTransfer.files); }}
                >
                  <p className="text-sm text-gray-600">Arrastra y suelta aquí, o haz clic para seleccionar</p>
                  <p className="text-xs text-gray-500 mt-1">Formatos: MP4/WEBM • Tamaño máx: 100 MB</p>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => handleUploadVideos(e.target.files)}
                  />
                </div>
                {form.videos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {form.videos.map((vid, i) => (
                      <div key={i} className="relative bg-black rounded-lg overflow-hidden shadow">
                        <div className="absolute top-1 left-1 text-xs bg-white/80 rounded px-2 py-0.5">
                          {i === 0 ? 'Primario' : `#${i + 1}`}
                        </div>
                        <video src={vid.url} className="w-full h-40 object-cover" controls preload="metadata" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full h-7 w-7 flex items-center justify-center"
                          onClick={() => removeVideo(i)}
                          title="Quitar video"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">Se usará el primero como videoUrl</div>
              </div>

              {/* Translations (title + description) */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Traducciones</h3>
                  <button className="text-sm text-blue-600" onClick={() => {
                    const code = prompt('Código de idioma (ej: es, pt, fr) — EN ya está como base');
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
