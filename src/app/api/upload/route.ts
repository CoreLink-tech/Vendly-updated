import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { uploadToR2 } from '@/lib/r2';

export const runtime = 'nodejs';
export const maxDuration = 30;

const WEBP_QUALITY = 82;
const MAX_WIDTH = 1200;
// Reject before we ever hand a buffer to sharp. Without this, a huge or
// maliciously crafted "decompression bomb" file (a tiny file that decodes
// to an enormous pixel grid) can exhaust the function's memory before the
// resize step ever gets a chance to shrink it down.
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12MB — generous for a phone photo, not for an attack

async function toWebp(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer, { limitInputPixels: 40_000_000 }) // ~40MP cap, well above any real photo need
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const contentType = request.headers.get('content-type') || '';
    let fileBuffer: Buffer;
    let bucket: string;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const bucketParam = (formData.get('bucket') as string) || 'product-images';
      if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });
      if (file.size > MAX_UPLOAD_BYTES) {
        return Response.json({ error: 'File too large. Max size is 12MB.' }, { status: 413 });
      }
      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
      bucket = ['product-images', 'vendor-logos'].includes(bucketParam) ? bucketParam : 'product-images';
    } else if (contentType.includes('application/json')) {
      const body = await request.json() as { url?: string; base64?: string; bucket?: string };
      bucket = body.bucket || 'product-images';
      if (body.base64) {
        const matches = body.base64.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) return Response.json({ error: 'Invalid base64' }, { status: 400 });
        if (matches[2].length > MAX_UPLOAD_BYTES * 1.4) { // base64 is ~1.37x larger than raw bytes
          return Response.json({ error: 'File too large. Max size is 12MB.' }, { status: 413 });
        }
        fileBuffer = Buffer.from(matches[2], 'base64');
      } else if (body.url) {
        const res = await fetch(body.url);
        const contentLength = res.headers.get('content-length');
        if (contentLength && Number(contentLength) > MAX_UPLOAD_BYTES) {
          return Response.json({ error: 'File too large. Max size is 12MB.' }, { status: 413 });
        }
        fileBuffer = Buffer.from(await res.arrayBuffer());
      } else {
        return Response.json({ error: 'No file, url, or base64 provided' }, { status: 400 });
      }
      if (fileBuffer.length > MAX_UPLOAD_BYTES) {
        return Response.json({ error: 'File too large. Max size is 12MB.' }, { status: 413 });
      }
    } else {
      return Response.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    // Convert everything to WebP
    const webpBuffer = await toWebp(fileBuffer);
    const filename = `${bucket}/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    let publicUrl: string;
    try {
      publicUrl = await uploadToR2(filename, webpBuffer, 'image/webp');
    } catch (err) {
      console.error('R2 upload error:', err);
      return Response.json({ error: 'Upload failed' }, { status: 500 });
    }

    return Response.json({ url: publicUrl, mimeType: 'image/webp' });
  } catch (err) {
    console.error('Upload error:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
