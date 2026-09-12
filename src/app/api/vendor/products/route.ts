import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { withImagesList } from '@/lib/utils';
import { sanitizeSearchInput } from '@/lib/sanitize';
import { randomBytes } from 'crypto';

// products.shareCode is a unique, NOT NULL column in the live DB (short
// code for shareable product links) with no default and no trigger —
// every insert must supply one explicitly or Postgres rejects the row.
function generateShareCode() {
  return randomBytes(5).toString('base64url');
}

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
  const search = sanitizeSearchInput(searchParams.get('search') || '');
  const category = searchParams.get('category') || '';

  let query = supabase.from('products').select('*, product_images(url, sortOrder)').eq('vendorId', vendorId).order('createdAt', { ascending: false });
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  if (category) query = query.eq('category', category);

  const { data: products } = await query;
  return Response.json({ products: withImagesList(products) });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Vendor profile not found' }, { status: 404 });

  const body = await request.json() as { name: string; description?: string; price: number; compareAtPrice?: number | null; category?: string; stock?: number; images?: string[] };
  if (!body.name || !body.price) return Response.json({ error: 'Name and price are required' }, { status: 400 });
  // Storefront only shows products with stock > 0 (api/store/[slug]/route.ts)
  // — a product saved with 0/missing stock silently never appears there, so
  // reject it here rather than letting vendors create invisible products.
  if (body.stock == null || body.stock < 1) {
    return Response.json({ error: 'Stock is required and must be at least 1' }, { status: 400 });
  }
  if (body.images && body.images.length > 8) {
    return Response.json({ error: 'Maximum 8 images per product' }, { status: 400 });
  }
  if (body.compareAtPrice != null && body.compareAtPrice <= body.price) {
    return Response.json({ error: 'Compare-at price must be higher than the price' }, { status: 400 });
  }

  // Retry on the (rare) shareCode collision — the column is uniquely
  // indexed, so a duplicate 7-char code fails the insert with a 23505.
  // Anything else is a real failure and should surface as an error, not
  // silently produce an empty product like before.
  let product = null;
  let insertError: { code?: string; message: string } | null = null;
  for (let attempt = 0; attempt < 3 && !product; attempt++) {
    const { data, error } = await supabase.from('products').insert({
      vendorId, name: body.name, description: body.description || '',
      price: body.price, compareAtPrice: body.compareAtPrice ?? null, category: body.category || '', stock: body.stock || 0, status: 'active',
      shareCode: generateShareCode(),
    }).select().single();
    if (data) { product = data; break; }
    insertError = error;
    if (error?.code !== '23505') break;
  }

  if (!product) {
    console.error('[vendor/products] insert failed:', insertError?.message);
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }

  if (body.images?.length) {
    await supabase.from('product_images').insert(body.images.map((url, i) => ({ productId: product.id, url, sortOrder: i })));
  }

  return Response.json({ product }, { status: 201 });
}
