import { supabase } from '@/lib/supabase';
import { withImagesList } from '@/lib/utils';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();

  const { data: vendor } = await supabase.from('vendors').select('id, businessName, description, logo, location, phone, address, slug, status, useLogistics, allowPayOnDelivery, bankName, accountNumber, accountName, primaryColor, backgroundColor, user(email)').eq('slug', normalizedSlug).eq('status', 'active').single();
  if (!vendor) return Response.json({ error: 'Store not found' }, { status: 404 });

  const { data: products } = await supabase.from('products').select('*, product_images(url, sortOrder)').eq('vendorId', vendor.id).eq('status', 'active').gt('stock', 0).order('createdAt', { ascending: false });

  return Response.json({ vendor, products: withImagesList(products) });
}
