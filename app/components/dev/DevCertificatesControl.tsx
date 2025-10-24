"use client";
import { useCreateCertificate, type CertificatePayload, type CertificateTranslations } from '@/app/hooks/useCertificates';
import React, { useMemo, useRef, useState } from 'react';

async function uploadToCloudinary(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('resourceType', 'image');
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

type TranslationFields = {
  title?: string;
  subtitle?: string;
  description?: string;
};

export const DevCertificatesControl: React.FC = () => {
  const isDev = useMemo(() => process.env.NODE_ENV === 'development', []);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [form, setForm] = useState<CertificatePayload>({
    title: '',
    subtitle: '',
    description: '',
    issuer: '',
    imageUrl: null,
    verifyUrl: '',
    downloadUrl: '',
    sortOrder: 0,
  });
  const [translations, setTranslations] = useState<Record<string, TranslationFields>>({ es: {} });

  const { mutateAsync: createCertificate } = useCreateCertificate();

  // Listen for external trigger
  React.useEffect(() => {
    const handler = () => setOpen(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('open-dev-certificates', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-dev-certificates', handler as EventListener);
      }
    };
  }, []);

  if (!isDev) return null;

  const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleUploadImage = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const isImage = file.type?.startsWith('image/');
    const okSize = file.size <= IMAGE_MAX_BYTES;
    if (!isImage) { setError('El archivo no es una imagen válida'); return; }
    if (!okSize) { setError(`La imagen supera el límite (${formatBytes(file.size)} > 10 MB)`); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const res = await uploadToCloudinary(file);
      setImageUrl(res.url);
      setForm((f) => ({ ...f, imageUrl: res.url }));
      setSuccess('Imagen subida');
    } catch (e: any) {
      setError(e?.message || 'Error subiendo imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null);
      if (!form.title.trim()) { setError('El título es obligatorio'); return; }
      const filteredTranslations: CertificateTranslations = Object.fromEntries(
        Object.entries(translations)
          .filter(([locale]) => locale.toLowerCase() !== 'en')
          .map(([locale, t]) => [locale.toLowerCase(), {
            ...(t.title ? { title: t.title } : {}),
            ...(t.subtitle ? { subtitle: t.subtitle } : {}),
            ...(t.description ? { description: t.description } : {}),
          }])
      );

      await createCertificate({ certificate: {
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description || null,
        issuer: form.issuer || null,
        imageUrl: form.imageUrl || imageUrl || null,
        verifyUrl: form.verifyUrl || null,
        downloadUrl: form.downloadUrl || null,
        sortOrder: form.sortOrder ?? 0,
      }, translations: filteredTranslations });
      setSuccess('Certificado creado');
      setForm({ title: '', subtitle: '', description: '', issuer: '', imageUrl: null, verifyUrl: '', downloadUrl: '', sortOrder: 0 });
      setTranslations({ es: {} });
      setImageUrl(null);
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Error creando certificado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Nuevo Certificado (Dev)</h2>
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
                <label className="block text-sm font-medium">Subtítulo (base, EN)</label>
                <input value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Descripción (base, EN)</label>
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Emisor</label>
                <input value={form.issuer || ''} onChange={e => setForm({ ...form, issuer: e.target.value })} className="w-full border rounded px-3 py-2" />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-1">Imagen</label>
                {imageUrl ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="uploaded" className="w-32 h-32 object-cover rounded-lg shadow" />
                    <button className="text-sm text-red-600" onClick={() => { setImageUrl(null); setForm((f) => ({ ...f, imageUrl: null })); }}>Quitar</button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer"
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleUploadImage(e.dataTransfer.files); }}
                  >
                    <p className="text-sm text-gray-600">Arrastra y suelta aquí, o haz clic para seleccionar</p>
                    <p className="text-xs text-gray-500 mt-1">Formatos: PNG/JPG • Tamaño máx: 10 MB</p>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleUploadImage(e.target.files)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Verificación URL</label>
                  <input value={form.verifyUrl || ''} onChange={e => setForm({ ...form, verifyUrl: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Descarga URL</label>
                  <input value={form.downloadUrl || ''} onChange={e => setForm({ ...form, downloadUrl: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Orden</label>
                  <input type="number" value={form.sortOrder ?? 0} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              {/* Translations (title + subtitle + description) */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Traducciones</h3>
                  <button className="text-sm text-blue-600" onClick={() => {
                    const code = prompt('Código de idioma (ej: es, pt, fr) — EN ya está como base');
                    if (code) {
                      const l = code.toLowerCase();
                      if (l === 'en') return;
                      setTranslations((t) => ({ ...t, [l]: t[l] || {} }));
                    }
                  }}>+ Añadir idioma</button>
                </div>
                {Object.entries(translations).map(([locale, t]) => (
                  <div key={locale} className="border rounded p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{locale.toUpperCase()}</div>
                      <button className="text-xs text-red-600" onClick={() => {
                        const rest = Object.fromEntries(Object.entries(translations).filter(([l]) => l !== locale));
                        setTranslations(rest);
                      }}>Quitar</button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <input placeholder="Título" value={t.title || ''} onChange={e => setTranslations({ ...translations, [locale]: { ...t, title: e.target.value } })} className="w-full border rounded px-3 py-2" />
                      <input placeholder="Subtítulo" value={t.subtitle || ''} onChange={e => setTranslations({ ...translations, [locale]: { ...t, subtitle: e.target.value } })} className="w-full border rounded px-3 py-2" />
                      <textarea placeholder="Descripción" value={t.description || ''} onChange={e => setTranslations({ ...translations, [locale]: { ...t, description: e.target.value } })} className="w-full border rounded px-3 py-2" />
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
