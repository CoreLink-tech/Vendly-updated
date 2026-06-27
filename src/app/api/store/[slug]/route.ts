import { supabase } from '@/lib/supabase';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: vendor } = await supabase.from('vendors').select('*, user(email)').eq('slug', slug).eq('status', 'active').single();
  if (!vendor) return Response.json({ error: 'Store not found' }, { status: 404 });

  const { data: products } = await supabase.from('products').select('*, product_images(url, sortOrder)').eq('vendorId', vendor.id).eq('status', 'active').gt('stock', 0).order('createdAt', { ascending: false });

  return Response.json({ vendor, products });
}
