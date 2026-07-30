export async function uploadToCloudinary(
  file: File | Blob,
  opts?: { resourceType?: 'image' | 'video' | 'auto'; publicId?: string; overwrite?: boolean }
): Promise<{ url: string; public_id: string; resource_type: string }> {
  const fd = new FormData();
  fd.append('file', file, file instanceof File ? file.name : 'upload.jpg');
  fd.append('resourceType', opts?.resourceType || 'image');
  if (opts?.publicId) fd.append('publicId', opts.publicId);
  if (typeof opts?.overwrite !== 'undefined') fd.append('overwrite', String(opts.overwrite));
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function deleteFromCloudinary(url: string): Promise<void> {
  const params = new URLSearchParams({ url });
  const res = await fetch(`/api/upload?${params.toString()}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
}
