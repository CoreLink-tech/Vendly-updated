import { supabase } from '@/lib/supabase';
import { getClientIp } from '@/lib/request';

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

  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('slug', slug.toLowerCase())
    .eq('status', 'active')
    .single();

  if (vendorError) console.error('[store/[slug]/report] vendor lookup failed:', vendorError.message);
  if (!vendor) return Response.json({ error: 'Store not found' }, { status: 404 });

  // Hard rate limit, not just a dedupe — the risk here is a flood of
  // distinct fake complaints burying real ones in a vendor's dashboard,
  // not identical repeats. 3 per hour per IP per vendor is generous for a
  // real frustrated customer, restrictive for a scripted flood.
  const ip = getClientIp(request);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('vendorId', vendor.id)
    .eq('ipAddress', ip)
    .gte('createdAt', oneHourAgo);
  if ((recentCount || 0) >= 3) {
    return Response.json({ error: 'Too many reports submitted. Please try again later.' }, { status: 429 });
  }

  const { error } = await supabase.from('reports').insert({
    vendorId: vendor.id,
    customerName,
    customerPhone,
    message,
    ipAddress: ip,
  });

  if (error) return Response.json({ error: 'Failed to submit report' }, { status: 500 });

  return Response.json({ success: true }, { status: 201 });
}
