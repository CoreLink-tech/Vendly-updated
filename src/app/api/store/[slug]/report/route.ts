import { supabase } from '@/lib/supabase';

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = (await request.json()) as {
    customerName?: string;
    customerPhone?: string;
    message?: string;
  };

  const customerName = (body.customerName || '').trim();
  const customerPhone = (body.customerPhone || '').trim();
  const message = (body.message || '').trim();

  if (!customerName || !customerPhone || !message) {
    return Response.json({ error: 'Name, phone number, and message are required' }, { status: 400 });
  }
  if (customerName.length > 100 || customerPhone.length > 30) {
    return Response.json({ error: 'Name or phone number is too long' }, { status: 400 });
  }
  if (message.length > 2000) {
    return Response.json({ error: 'Message is too long (max 2000 characters)' }, { status: 400 });
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!vendor) return Response.json({ error: 'Store not found' }, { status: 404 });

  const { error } = await supabase.from('reports').insert({
    vendorId: vendor.id,
    customerName,
    customerPhone,
    message,
  });

  if (error) return Response.json({ error: 'Failed to submit report' }, { status: 500 });

  return Response.json({ success: true }, { status: 201 });
}
