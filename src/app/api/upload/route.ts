import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const contentType = request.headers.get('content-type') || '';
    let fileBuffer: Buffer;
    let mimeType: string;
    let bucket: string;
    let ext: string;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const bucketParam = formData.get('bucket') as string || 'product-images';
      if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
      mimeType = file.type || 'image/jpeg';
      bucket = ['product-images', 'vendor-logos'].includes(bucketParam) ? bucketParam : 'product-images';
      ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    } else if (contentType.includes('application/json')) {
      const body = await request.json() as { url?: string; base64?: string; bucket?: string };
      bucket = body.bucket || 'product-images';

      if (body.base64) {
        const matches = body.base64.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) return Response.json({ error: 'Invalid base64' }, { status: 400 });
        mimeType = matches[1];
        fileBuffer = Buffer.from(matches[2], 'base64');
        ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      } else if (body.url) {
        const res = await fetch(body.url);
        const bytes = await res.arrayBuffer();
        fileBuffer = Buffer.from(bytes);
        mimeType = res.headers.get('content-type') || 'image/jpeg';
        ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      } else {
        return Response.json({ error: 'No file, url, or base64 provided' }, { status: 400 });
      }
    } else {
      return Response.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    // Generate unique filename
    const filename = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return Response.json({ url: publicUrl, mimeType });
  } catch (err) {
    console.error('Upload error:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
