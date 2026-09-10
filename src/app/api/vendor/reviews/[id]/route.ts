import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function getVendorId(userId: string) {
  const { data } = await supabase.from('vendors').select('id').eq('userId', userId).single();
  return data?.id || null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json() as { status?: string };
  if (body.status !== 'published' && body.status !== 'hidden') {
    return Response.json({ error: "Status must be 'published' or 'hidden'" }, { status: 400 });
  }

  // Verify ownership before updating — this review must belong to one of
  // this vendor's own products, not just any review in the table.
  const { data: owned } = await supabase.from('reviews').select('id').eq('id', id).eq('vendorId', vendorId).single();
  if (!owned) return Response.json({ error: 'Review not found' }, { status: 404 });

  const { data: review } = await supabase.from('reviews').update({ status: body.status }).eq('id', id).eq('vendorId', vendorId).select().single();

  return Response.json({ review });
}
