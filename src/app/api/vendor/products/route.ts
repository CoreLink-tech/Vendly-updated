import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function getVendorId(userId: string) {
  const { data } = await supabase.from('vendors').select('id').eq('userId', userId).single();
  return data?.id || null;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ products: [] });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  let query = supabase.from('products').select('*, product_images(url, sortOrder)').eq('vendorId', vendorId).order('createdAt', { ascending: false });
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  if (category) query = query.eq('category', category);

  const { data: products } = await query;
  return Response.json({ products });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Vendor profile not found' }, { status: 404 });

  const body = await request.json() as { name: string; description?: string; price: number; category?: string; stock?: number; images?: string[] };
  if (!body.name || !body.price) return Response.json({ error: 'Name and price are required' }, { status: 400 });

  const { data: product } = await supabase.from('products').insert({
    vendorId, name: body.name, description: body.description || '',
    price: body.price, category: body.category || '', stock: body.stock || 0, status: 'active',
  }).select().single();

  if (body.images?.length && product) {
    await supabase.from('product_images').insert(body.images.map((url, i) => ({ productId: product.id, url, sortOrder: i })));
  }

  return Response.json({ product }, { status: 201 });
}
