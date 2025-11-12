import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '../../../../lib/cloudinaryService';

// Simple in-memory cache per process to reduce Cloudinary calls during dev
const cache = new Map<string, { data: any; expires: number }>();
const DEFAULT_TTL_MS = 60_000; // 60s

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix')?.trim();
    const resourceType = (searchParams.get('resourceType') as 'image' | 'video' | 'all' | null) || 'all';
    const ttl = Number(searchParams.get('ttl') || '') || DEFAULT_TTL_MS;

    if (!prefix) {
      return NextResponse.json({ error: 'Missing prefix' }, { status: 400 });
    }

    // Cache key and lookup
    const key = `${prefix}|${resourceType}`;
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expires > now) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    const data = await CloudinaryService.listByPrefix(prefix, { resourceType });

    cache.set(key, { data, expires: now + Math.max(5_000, ttl) });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err: any) {
    console.error('media/by-prefix GET error:', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
