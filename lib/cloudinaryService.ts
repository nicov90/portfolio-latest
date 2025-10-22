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
  static async uploadBuffer(
    buffer: Buffer,
    opts?: {
      folder?: string;
      resourceType?: CloudinaryResourceType;
      filename?: string;
      tags?: string[];
    }
  ): Promise<any> {
    const folder = opts?.folder ?? CLOUDINARY_UPLOAD_FOLDER ?? 'portfolio';
    const resource_type: any = opts?.resourceType ?? 'auto';
    const uploadOptions: any = {
      folder,
      resource_type,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
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
}
