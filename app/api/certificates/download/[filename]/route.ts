import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const runtime = 'nodejs';

const CERTIFICATES_DIR = path.join(process.cwd(), 'public', 'certificates');
const ALLOWED_EXTENSIONS: Record<string, string> = {
  '.pdf': 'application/pdf',
};

export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const ext = path.extname(filename).toLowerCase();
  const contentType = ALLOWED_EXTENSIONS[ext];

  // Reject anything that isn't a plain filename inside CERTIFICATES_DIR — no path traversal,
  // no reaching outside the certificates folder, and only known-safe extensions get served.
  if (!contentType || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const filePath = path.join(CERTIFICATES_DIR, filename);
  if (!filePath.startsWith(CERTIFICATES_DIR) || !existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const buffer = await readFile(filePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
