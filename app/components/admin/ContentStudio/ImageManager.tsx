"use client";
import { ChevronLeft, ChevronRight, Pencil, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { deleteFromCloudinary, uploadToCloudinary } from '../../../../lib/uploadClient';
import { ImageCropModal } from './ImageCropModal';

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxSizeBytes?: number;
  maxImages?: number;
}

export const ImageManager: React.FC<ImageManagerProps> = ({ images, onChange, maxSizeBytes = 10 * 1024 * 1024, maxImages }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);

  const remainingSlots = typeof maxImages === 'number' ? Math.max(0, maxImages - images.length) : Infinity;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || remainingSlots <= 0) return;
    setUploading(true);
    setError(null);
    try {
      const accepted = Array.from(files).slice(0, remainingSlots).filter((f) => {
        if (!f.type.startsWith('image/')) return false;
        if (f.size > maxSizeBytes) return false;
        return true;
      });
      if (accepted.length === 0) {
        setError('Ningún archivo válido (debe ser imagen, máx. 10MB)');
        return;
      }
      const uploaded = await Promise.all(accepted.map((f) => uploadToCloudinary(f)));
      onChange([...images, ...uploaded.map((u) => u.url)]);
    } catch (e: any) {
      setError(e?.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = async (index: number) => {
    const url = images[index];
    onChange(images.filter((_, i) => i !== index));
    try {
      await deleteFromCloudinary(url);
    } catch {
      // Non-fatal: image is removed from the project either way
    }
  };

  const moveTo = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const handleCropped = async (blob: Blob) => {
    if (cropIndex === null) return;
    const oldUrl = images[cropIndex];
    const uploaded = await uploadToCloudinary(blob);
    const next = [...images];
    next[cropIndex] = uploaded.url;
    onChange(next);
    try {
      await deleteFromCloudinary(oldUrl);
    } catch {
      // Non-fatal
    }
  };

  return (
    <div className="space-y-3">
      {remainingSlots > 0 && (
        <div
          className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-accent/50 cursor-pointer transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files); }}
        >
          <Upload className="mx-auto mb-2 text-muted-foreground" size={20} />
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Subiendo…' : 'Arrastrá imágenes aquí o hacé clic para elegir'}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={remainingSlots > 1}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div key={url + i} className="relative rounded-lg overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-32 object-cover" />
              <span className="absolute top-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                title="Eliminar imagen"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
              {/* Reorder arrows + centered crop/edit button, always visible (touch-friendly, no hover dependency) */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-6 pb-2 flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveTo(i, -1)}
                    disabled={i === 0}
                    title="Mover a la izquierda"
                    className="w-6 h-6 rounded-full bg-white/90 text-gray-800 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTo(i, 1)}
                    disabled={i === images.length - 1}
                    title="Mover a la derecha"
                    className="w-6 h-6 rounded-full bg-white/90 text-gray-800 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setCropIndex(i)}
                  title="Editar / recortar imagen"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-gray-800 text-xs font-medium shadow"
                >
                  <Pencil size={12} />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cropIndex !== null && (
        <ImageCropModal
          imageSrc={images[cropIndex]}
          open={cropIndex !== null}
          onClose={() => setCropIndex(null)}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
};
