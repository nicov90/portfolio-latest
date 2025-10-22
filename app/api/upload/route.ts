import { NextResponse } from 'next/server';
import { CloudinaryService } from '../../../lib/cloudinaryService';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const folder = (form.get('folder') as string) || undefined;
    const resourceType = (form.get('resourceType') as 'image' | 'video' | 'auto') || 'auto';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const res = await CloudinaryService.uploadBuffer(buffer, { folder, resourceType });
    return NextResponse.json({
      url: res.secure_url || res.url,
      public_id: res.public_id,
      resource_type: res.resource_type,
      width: res.width,
      height: res.height,
      bytes: res.bytes,
      format: res.format,
    });
  } catch (err: any) {
    console.error('Upload error', err);
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}
