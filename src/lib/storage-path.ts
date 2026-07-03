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
