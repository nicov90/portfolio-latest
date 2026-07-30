import { NextResponse } from 'next/server';
import { CloudinaryService } from '../../../lib/cloudinaryService';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const folder = (form.get('folder') as string) || undefined;
    const resourceType = (form.get('resourceType') as 'image' | 'video' | 'auto') || 'auto';
    const publicId = (form.get('publicId') as string) || undefined;
    const overwriteRaw = (form.get('overwrite') as string) || undefined;
    const overwrite = overwriteRaw ? ['1', 'true', 'yes'].includes(overwriteRaw.toLowerCase()) : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

  const res = await CloudinaryService.uploadBuffer(buffer, { folder, resourceType, publicId, overwrite });
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let publicId = searchParams.get('publicId') || undefined;
    const url = searchParams.get('url') || undefined;
    const resourceType = (searchParams.get('resourceType') as 'image' | 'video') || 'image';

    if (!publicId && url) {
      publicId = CloudinaryService.publicIdFromUrl(url) || undefined;
    }
    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId or a parseable url' }, { status: 400 });
    }

    const result = await CloudinaryService.destroy(publicId, { resourceType });
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error('Delete error', err);
    return NextResponse.json({ error: err?.message || 'Delete failed' }, { status: 500 });
  }
}
