const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_FOLDER = 'portfolio',
} = process.env as Record<string, string | undefined>;

export type CloudinaryResourceType = 'image' | 'video' | 'auto';

async function getCloudinary() {
  const mod: any = await import('cloudinary');
  const cloudinary = mod.v2 || mod;
  if (!cloudinary.configured) {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.warn('[Cloudinary] Missing Cloudinary env vars. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  return cloudinary as any;
}

export class CloudinaryService {
  /**
   * Extracts the Cloudinary public_id (including folder path) from a secure delivery URL,
   * e.g. https://res.cloudinary.com/<cloud>/image/upload/v169.../portfolio/foo-1.jpg -> portfolio/foo-1
   */
  static publicIdFromUrl(url: string): string | null {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
    return match ? match[1] : null;
  }

  static async destroy(publicId: string, opts?: { resourceType?: 'image' | 'video' }): Promise<any> {
    const cloudinary = await getCloudinary();
    return cloudinary.uploader.destroy(publicId, { resource_type: opts?.resourceType ?? 'image' });
  }

  static async uploadBuffer(
    buffer: Buffer,
    opts?: {
      folder?: string;
      resourceType?: CloudinaryResourceType;
      publicId?: string;
      overwrite?: boolean;
      tags?: string[];
    }
  ): Promise<any> {
    const folder = opts?.folder ?? CLOUDINARY_UPLOAD_FOLDER ?? 'portfolio';
    const resource_type: any = opts?.resourceType ?? 'auto';
    const usingExplicitId = Boolean(opts?.publicId);
    const uploadOptions: any = {
      folder,
      resource_type,
      // If publicId provided, use exact id and control overwrite; otherwise keep filename-based unique naming
      public_id: opts?.publicId,
      use_filename: !usingExplicitId,
      unique_filename: !usingExplicitId,
      overwrite: usingExplicitId ? (opts?.overwrite ?? true) : false,
      tags: opts?.tags,
    };

    return new Promise((resolve, reject) => {
      getCloudinary().then((cloudinary) => {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error: any, result: any) => {
          if (error || !result) return reject(error);
          resolve(result);
        });
        stream.end(buffer);
      }).catch(reject);
    });
  }

  /**
   * List Cloudinary resources whose public_id starts with the given prefix.
   * It queries images and/or videos and returns basic info sorted by the numeric suffix if present.
   * Convention:
   *  - Video principal: prefix-0 (resource_type=video)
   *  - Imágenes: prefix-1, prefix-2, ... (resource_type=image)
   */
  static async listByPrefix(prefix: string, options?: { resourceType?: 'image' | 'video' | 'all'; maxResults?: number }) {
    const cloudinary = await getCloudinary();
    const typeOpt = options?.resourceType ?? 'all';
    const max = Math.min(Math.max(options?.maxResults ?? 100, 1), 500);

    async function fetchResources(rt: 'image' | 'video') {
      const res = await cloudinary.api.resources({
        type: 'upload',
        prefix,
        resource_type: rt,
        max_results: max,
      });
      return Array.isArray(res?.resources) ? res.resources : [];
    }

    const images = (typeOpt === 'image' || typeOpt === 'all') ? await fetchResources('image') : [];
    const videos = (typeOpt === 'video' || typeOpt === 'all') ? await fetchResources('video') : [];

    function parseSuffixOrder(publicId: string): number {
      const base = publicId.split('/').pop() || publicId;
      const parts = base.split('-');
      const last = parts[parts.length - 1];
      const n = parseInt(last, 10);
      return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
    }

    const imageItems = images
      .map((r: any) => ({
        url: r.secure_url || r.url,
        public_id: r.public_id,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        format: r.format,
        resource_type: r.resource_type,
        order: parseSuffixOrder(r.public_id),
      }))
      .filter((x: any) => x.order >= 1)
      .sort((a: any, b: any) => a.order - b.order);

    const video0 = videos
      .map((r: any) => ({
        url: r.secure_url || r.url,
        public_id: r.public_id,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        format: r.format,
        resource_type: r.resource_type,
        order: parseSuffixOrder(r.public_id),
      }))
      .filter((x: any) => x.order === 0)
      .sort((a: any, b: any) => a.public_id.localeCompare(b.public_id))[0] || null;

    return {
      images: imageItems.map((x: any) => x.url),
      video: video0 ? video0.url : null,
      raw: {
        images: imageItems,
        videos,
      },
    } as { images: string[]; video: string | null; raw: any };
  }
}
