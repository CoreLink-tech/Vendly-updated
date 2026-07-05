import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { deleteImageByUrl } from '@/lib/storage-path';

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

  const body = await request.json() as { businessName?: string; description?: string; logo?: string; location?: string; phone?: string; address?: string; slug?: string; referredBy?: string; ambassadorCode?: string; useLogistics?: boolean; allowPayOnDelivery?: boolean; bankName?: string; accountNumber?: string; accountName?: string; primaryColor?: string; backgroundColor?: string };
  const userId = session.user.id;

  const { data: existing } = await supabase.from('vendors').select('id, logo').eq('userId', userId).single();

  if (existing) {
    const oldLogoUrl = existing.logo;
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
      const normalizedSlug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const { data: taken } = await supabase.from('vendors').select('id').eq('slug', normalizedSlug).neq('userId', userId).limit(1);
      if (taken?.length) return Response.json({ error: 'This store URL is already taken' }, { status: 400 });
      updates.slug = normalizedSlug;
    }
    await supabase.from('vendors').update(updates).eq('id', existing.id);

    if (body.logo !== undefined && oldLogoUrl && oldLogoUrl !== body.logo) {
      await deleteImageByUrl(oldLogoUrl, 'vendor-logos');
    }

    const { data: updated } = await supabase.from('vendors').select('*').eq('id', existing.id).single();
    return Response.json({ vendor: updated });
  } else {
    const slug = (body.slug || (session.user.email?.split('@')[0] ?? '')).toLowerCase().replace(/[^a-z0-9-]/g, '');

    // A single code can come in as either an ambassador code or a regular
    // vendor referral slug — the signup form doesn't know which, since the
    // person could have typed it in manually rather than followed a link.
    // Check ambassador codes first; only fall back to treating it as a
    // vendor slug if it doesn't match one.
    const candidateCode = body.ambassadorCode || body.referredBy;
    let matchedAmbassador: { id: string } | null = null;
    if (candidateCode) {
      const { data: amb } = await supabase.from('ambassadors').select('id').eq('ambassadorCode', candidateCode).eq('status', 'approved').single();
      matchedAmbassador = amb;
    }

    const { data: vendor } = await supabase.from('vendors').insert({
      userId, businessName: body.businessName || session.user.name || '',
      description: body.description || '', logo: body.logo || null,
      location: body.location || '', phone: body.phone || '',
      address: body.address || '', slug, status: 'active',
      referredBy: matchedAmbassador ? null : (body.referredBy || null),
    }).select().single();

    if (vendor && matchedAmbassador) {
      // Tracked at registration, not activation — this is what makes
      // "total invites" mean everyone who signed up via the link, not just
      // the ones who eventually paid. plan starts as 'trial' and gets
      // updated to the real plan by /api/vendor/activate once they pay,
      // which is what makes them count as an "active" invite.
      await supabase.from('ambassador_referrals').insert({
        ambassadorId: matchedAmbassador.id,
        referredVendorId: vendor.id,
        plan: 'trial',
        commission: 0,
      });
    }

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
