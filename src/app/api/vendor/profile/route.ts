import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: vendor } = await supabase.from('vendors').select('*').eq('userId', session.user.id).single();
  if (!vendor) return Response.json({ vendor: null });

  const { data: subscription } = await supabase.from('subscriptions').select('*').eq('vendorId', vendor.id).eq('status', 'active').order('createdAt', { ascending: false }).limit(1).single();
  return Response.json({ vendor, subscription: subscription || null });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as { businessName?: string; description?: string; logo?: string; location?: string; phone?: string; address?: string; slug?: string; referredBy?: string; useLogistics?: boolean; allowPayOnDelivery?: boolean; bankName?: string; accountNumber?: string; accountName?: string; primaryColor?: string; backgroundColor?: string };
  const userId = session.user.id;

  const { data: existing } = await supabase.from('vendors').select('id').eq('userId', userId).single();

  if (existing) {
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.businessName !== undefined) updates.businessName = body.businessName;
    if (body.description !== undefined) updates.description = body.description;
    if (body.logo !== undefined) updates.logo = body.logo;
    if (body.location !== undefined) updates.location = body.location;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.address !== undefined) updates.address = body.address;
    if (body.useLogistics !== undefined) updates.useLogistics = body.useLogistics;
    if (body.allowPayOnDelivery !== undefined) updates.allowPayOnDelivery = body.allowPayOnDelivery;
    if (body.bankName !== undefined) updates.bankName = body.bankName;
    if (body.accountNumber !== undefined) updates.accountNumber = body.accountNumber;
    if (body.accountName !== undefined) updates.accountName = body.accountName;
    if (body.primaryColor !== undefined) {
      if (!HEX_COLOR_RE.test(body.primaryColor)) return Response.json({ error: 'Invalid primary color' }, { status: 400 });
      updates.primaryColor = body.primaryColor;
    }
    if (body.backgroundColor !== undefined) {
      if (!HEX_COLOR_RE.test(body.backgroundColor)) return Response.json({ error: 'Invalid background color' }, { status: 400 });
      updates.backgroundColor = body.backgroundColor;
    }
    if (body.slug !== undefined) {
      const { data: taken } = await supabase.from('vendors').select('id').eq('slug', body.slug).neq('userId', userId).limit(1);
      if (taken?.length) return Response.json({ error: 'This store URL is already taken' }, { status: 400 });
      updates.slug = body.slug;
    }
    await supabase.from('vendors').update(updates).eq('id', existing.id);
    const { data: updated } = await supabase.from('vendors').select('*').eq('id', existing.id).single();
    return Response.json({ vendor: updated });
  } else {
    const slug = body.slug || (session.user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '');
    const { data: vendor } = await supabase.from('vendors').insert({
      userId, businessName: body.businessName || session.user.name || '',
      description: body.description || '', logo: body.logo || null,
      location: body.location || '', phone: body.phone || '',
      address: body.address || '', slug, status: 'active',
      referredBy: body.referredBy || null,
    }).select().single();

    if (vendor) {
      // Auto-create 3-day free trial
      const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('subscriptions').insert({
        vendorId: vendor.id,
        plan: 'trial',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: trialEnd,
        trialEnd,
      });
    }

    return Response.json({ vendor }, { status: 201 });
  }
}
