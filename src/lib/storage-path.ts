/**
 * Supabase public URLs look like:
 *   https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
 * This pulls out just the {path} part so it can be passed to
 * `.storage.from(bucket).remove([path])`. Returns null if the URL doesn't
 * match the expected shape (e.g. it's from a different bucket or an
 * external URL) so callers can skip deletion rather than risk removing
 * the wrong thing.
 */
export function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

/**
 * Deletes an image file regardless of whether it's hosted on R2 (new
 * uploads, post-migration) or still on Supabase Storage (anything
 * uploaded before the migration that hasn't been replaced yet). Silently
 * no-ops if the URL doesn't match either pattern rather than throwing —
 * callers treat storage cleanup as best-effort, never blocking on it.
 */
export async function deleteImageByUrl(url: string, supabaseBucket: 'product-images' | 'vendor-logos'): Promise<void> {
  const { extractR2Key, deleteFromR2 } = await import('@/lib/r2');
  const r2Key = extractR2Key(url);
  if (r2Key) {
    try {
      await deleteFromR2(r2Key);
    } catch (err) {
      console.error('[deleteImageByUrl] R2 delete failed:', err);
    }
    return;
  }

  const supabasePath = extractStoragePath(url, supabaseBucket);
  if (supabasePath) {
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.storage.from(supabaseBucket).remove([supabasePath]);
    if (error) console.error('[deleteImageByUrl] Supabase delete failed:', error.message);
  }
}
