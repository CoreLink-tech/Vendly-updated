import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { withImages } from '@/lib/utils';

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
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.price !== undefined) updates.price = body.price;
  if (body.category !== undefined) updates.category = body.category;
  if (body.stock !== undefined) updates.stock = body.stock;
  if (body.status !== undefined) updates.status = body.status;

  await supabase.from('products').update(updates).eq('id', id).eq('vendorId', vendorId);

  if (body.images !== undefined) {
    await supabase.from('product_images').delete().eq('productId', id);
    if (body.images.length) await supabase.from('product_images').insert(body.images.map((url, i) => ({ productId: id, url, sortOrder: i })));
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

  await supabase.from('products').delete().eq('id', id).eq('vendorId', vendorId);
  return Response.json({ success: true });
}
