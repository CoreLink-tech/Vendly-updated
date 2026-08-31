import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { withImages } from '@/lib/utils';
import { deleteImageByUrl } from '@/lib/storage-path';

async function getVendorId(userId: string) {
  const { data } = await supabase.from('vendors').select('id').eq('userId', userId).single();
  return data?.id || null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  const { data: product } = await supabase.from('products').select('*, product_images(url, sortOrder)').eq('id', id).eq('vendorId', vendorId).single();
  if (!product) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ product: withImages(product) });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json() as { name?: string; description?: string; price?: number; category?: string; stock?: number; status?: string; images?: string[] };
  if (body.images && body.images.length > 8) {
    return Response.json({ error: 'Maximum 8 images per product' }, { status: 400 });
  }

  // Verify ownership explicitly before touching product_images — the
  // products.update() below is correctly scoped with .eq('vendorId', ...)
  // and just silently affects 0 rows if this vendor doesn't own it, but
  // nothing was stopping the product_images delete/insert further down
  // from running against ANY productId regardless of who owns it.
  const { data: owned } = await supabase.from('products').select('id').eq('id', id).eq('vendorId', vendorId).single();
  if (!owned) return Response.json({ error: 'Product not found' }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.price !== undefined) updates.price = body.price;
  if (body.category !== undefined) updates.category = body.category;
  if (body.stock !== undefined) updates.stock = body.stock;
  if (body.status !== undefined) updates.status = body.status;

  await supabase.from('products').update(updates).eq('id', id).eq('vendorId', vendorId);

  if (body.images !== undefined) {
    const { data: oldImages } = await supabase.from('product_images').select('url').eq('productId', id);
    await supabase.from('product_images').delete().eq('productId', id);
    if (body.images.length) await supabase.from('product_images').insert(body.images.map((url, i) => ({ productId: id, url, sortOrder: i })));

    // Only delete files from storage that were actually dropped from the
    // list — not every old URL. Images the vendor kept unchanged are still
    // referenced by the freshly-inserted rows above; deleting them from R2
    // here would leave the DB pointing at a file that no longer exists.
    const newUrls = new Set(body.images);
    const removedImages = (oldImages || []).filter((img) => !newUrls.has(img.url));
    if (removedImages.length) {
      await Promise.all(removedImages.map((img) => deleteImageByUrl(img.url, 'product-images')));
    }
  }

  const { data: product } = await supabase.from('products').select('*, product_images(url, sortOrder)').eq('id', id).single();
  return Response.json({ product: product ? withImages(product) : null });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  // Fetch image URLs before deleting — the FK cascade will remove the
  // product_images rows automatically, but it can't touch the actual
  // files sitting in storage. Grab them first or they're gone for good.
  const { data: images } = await supabase.from('product_images').select('url').eq('productId', id);

  const { error: deleteError } = await supabase.from('products').delete().eq('id', id).eq('vendorId', vendorId);
  if (deleteError) return Response.json({ error: 'Failed to delete product' }, { status: 500 });

  if (images?.length) {
    await Promise.all(images.map((img) => deleteImageByUrl(img.url, 'product-images')));
  }

  return Response.json({ success: true });
}
