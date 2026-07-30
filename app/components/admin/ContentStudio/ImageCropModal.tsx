"use client";
import React, { useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';

interface AspectOption {
  label: string;
  value: number | undefined; // undefined = free-form, no locked ratio
}

// Portrait (taller than wide) is the default, per how these images are mostly used on the site.
const ASPECT_OPTIONS: AspectOption[] = [
  { label: 'Vertical', value: 2 / 3 },
  { label: 'Retrato', value: 3 / 4 },
  { label: 'Cuadrado', value: 1 },
  { label: 'Paisaje', value: 4 / 3 },
  { label: 'Panorámico', value: 16 / 9 },
  { label: 'Libre', value: undefined },
];

const DEFAULT_ASPECT = 2 / 3;

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 100 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

function centerFreeCrop(): Crop {
  return { unit: '%', x: 0, y: 0, width: 100, height: 100 };
}

interface ImageCropModalProps {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onCropped: (blob: Blob) => void | Promise<void>;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageSrc, open, onClose, onCropped }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspect, setAspect] = useState<number | undefined>(DEFAULT_ASPECT);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [saving, setSaving] = useState(false);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setCrop(aspect ? centerAspectCrop(naturalWidth, naturalHeight, aspect) : centerFreeCrop());
  };

  const handleAspectChange = (value: number | undefined) => {
    setAspect(value);
    const img = imgRef.current;
    if (!img) return;
    setCrop(value ? centerAspectCrop(img.naturalWidth, img.naturalHeight, value) : centerFreeCrop());
  };

  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || !completedCrop?.width || !completedCrop?.height) return;
    setSaving(true);
    try {
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      const cropWidth = Math.round(completedCrop.width * scaleX);
      const cropHeight = Math.round(completedCrop.height * scaleY);

      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas no disponible');
      ctx.drawImage(
        img,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas vacío'))), 'image/jpeg', 0.92);
      });

      await onCropped(blob);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recortar imagen</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleAspectChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                aspect === opt.value
                  ? 'bg-[#00bfe6] text-white border-[#00bfe6]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#00bfe6]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-auto flex justify-center bg-black/5 rounded-lg p-2">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Imagen a recortar"
              crossOrigin="anonymous"
              onLoad={onImageLoad}
              style={{ maxHeight: '50vh' }}
            />
          </ReactCrop>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={saving || !completedCrop?.width}>
            {saving ? 'Guardando…' : 'Aplicar recorte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
