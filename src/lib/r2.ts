import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// R2 speaks the S3 API, so the standard AWS SDK works against it — just
// point it at Cloudflare's endpoint instead of AWS's. One bucket is used
// for everything, with folder-style key prefixes (product-images/...,
// vendor-logos/...) standing in for what used to be two separate Supabase
// buckets. Keeps the Cloudflare-side setup to a single bucket.

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function r2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${getEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: getEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
}

/**
 * Uploads a buffer to R2 under the given key (e.g.
 * 'product-images/{userId}/{filename}.webp') and returns the public URL.
 * Requires the bucket to have public access enabled (either via the
 * r2.dev subdomain or a custom domain) — this doesn't generate signed
 * URLs, it assumes the object is meant to be publicly readable, same as
 * the Supabase buckets were.
 */
export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  const client = r2Client();
  const bucket = getEnv('R2_BUCKET_NAME');
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return `${getEnv('R2_PUBLIC_URL').replace(/\/$/, '')}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = r2Client();
  const bucket = getEnv('R2_BUCKET_NAME');
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/**
 * Pulls the R2 object key back out of a public URL, mirroring
 * extractStoragePath() for Supabase. Returns null if the URL doesn't
 * start with the configured R2_PUBLIC_URL, so callers can skip deletion
 * rather than risk touching the wrong thing (e.g. a leftover
 * Supabase-hosted URL from before this migration).
 */
export function extractR2Key(publicUrl: string): string | null {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
  if (!base || !publicUrl.startsWith(base + '/')) return null;
  return publicUrl.slice(base.length + 1);
}
