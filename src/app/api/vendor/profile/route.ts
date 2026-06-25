import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendors = await sql`SELECT * FROM vendors WHERE "userId" = ${session.user.id} LIMIT 1`;
  const vendor = vendors[0] || null;

  if (!vendor) {
    return Response.json({ vendor: null });
  }

  const subs = await sql`
    SELECT * FROM subscriptions WHERE "vendorId" = ${vendor.id} AND status = 'active' ORDER BY "createdAt" DESC LIMIT 1
  `;

  return Response.json({ vendor, subscription: subs[0] || null });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    businessName?: string;
    description?: string;
    logo?: string;
    location?: string;
    phone?: string;
    address?: string;
    slug?: string;
    referredBy?: string;
  };

  const userId = session.user.id;

  // Check if vendor exists
  const existing = await sql`SELECT id FROM vendors WHERE "userId" = ${userId} LIMIT 1`;

  if (existing.length) {
    // Update
    const { businessName, description, logo, location, phone, address, slug } = body;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (businessName !== undefined) {
      setClauses.push(`"businessName" = $${paramIndex++}`);
      values.push(businessName);
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (logo !== undefined) {
      setClauses.push(`logo = $${paramIndex++}`);
      values.push(logo);
    }
    if (location !== undefined) {
      setClauses.push(`location = $${paramIndex++}`);
      values.push(location);
    }
    if (phone !== undefined) {
      setClauses.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (address !== undefined) {
      setClauses.push(`address = $${paramIndex++}`);
      values.push(address);
    }
    if (slug !== undefined) {
      // Check slug uniqueness
      const slugCheck = await sql(`SELECT id FROM vendors WHERE slug = $1 AND "userId" != $2`, [
        slug,
        userId,
      ]);
      if (slugCheck.length) {
        return Response.json({ error: 'This store URL is already taken' }, { status: 400 });
      }
      setClauses.push(`slug = $${paramIndex++}`);
      values.push(slug);
    }

    setClauses.push(`"updatedAt" = NOW()`);
    values.push(existing[0].id);

    await sql(`UPDATE vendors SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`, values);

    const updated = await sql`SELECT * FROM vendors WHERE id = ${existing[0].id}`;
    return Response.json({ vendor: updated[0] });
  } else {
    // Create vendor profile
    const slug =
      body.slug ||
      (session.user.email
        ?.split('@')[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '') ??
        '');

    const result = await sql`
      INSERT INTO vendors ("userId", "businessName", description, logo, location, phone, address, slug, status, "referredBy")
      VALUES (
        ${userId},
        ${body.businessName || session.user.name || ''},
        ${body.description || ''},
        ${body.logo || null},
        ${body.location || ''},
        ${body.phone || ''},
        ${body.address || ''},
        ${slug},
        'pending',
        ${body.referredBy || null}
      )
      RETURNING *
    `;
    return Response.json({ vendor: result[0] }, { status: 201 });
  }
}
