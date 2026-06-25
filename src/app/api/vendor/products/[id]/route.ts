import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

async function getVendorId(userId: string): Promise<string | null> {
  const vendors = await sql`SELECT id FROM vendors WHERE "userId" = ${userId} LIMIT 1`;
  return vendors[0]?.id || null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  const products = await sql`
    SELECT p.*, COALESCE(
      (SELECT json_agg(pi.url ORDER BY pi."sortOrder") FROM product_images pi WHERE pi."productId" = p.id),
      '[]'::json
    ) as images
    FROM products p WHERE p.id = ${id} AND p."vendorId" = ${vendorId}
  `;

  if (!products.length) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ product: products[0] });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    stock?: number;
    status?: string;
    images?: string[];
  };

  const { name, description, price, category, stock, status, images } = body;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (name !== undefined) {
    setClauses.push(`name = $${i++}`);
    values.push(name);
  }
  if (description !== undefined) {
    setClauses.push(`description = $${i++}`);
    values.push(description);
  }
  if (price !== undefined) {
    setClauses.push(`price = $${i++}`);
    values.push(price);
  }
  if (category !== undefined) {
    setClauses.push(`category = $${i++}`);
    values.push(category);
  }
  if (stock !== undefined) {
    setClauses.push(`stock = $${i++}`);
    values.push(stock);
  }
  if (status !== undefined) {
    setClauses.push(`status = $${i++}`);
    values.push(status);
  }
  setClauses.push(`"updatedAt" = NOW()`);
  values.push(id);
  values.push(vendorId);

  await sql(
    `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${i++} AND "vendorId" = $${i}`,
    values
  );

  // Update images if provided
  if (images !== undefined) {
    await sql`DELETE FROM product_images WHERE "productId" = ${id}`;
    for (let j = 0; j < images.length; j++) {
      await sql`INSERT INTO product_images ("productId", url, "sortOrder") VALUES (${id}, ${images[j]}, ${j})`;
    }
  }

  const updated = await sql`
    SELECT p.*, COALESCE(
      (SELECT json_agg(pi.url ORDER BY pi."sortOrder") FROM product_images pi WHERE pi."productId" = p.id),
      '[]'::json
    ) as images
    FROM products p WHERE p.id = ${id}
  `;
  return Response.json({ product: updated[0] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  await sql`DELETE FROM products WHERE id = ${id} AND "vendorId" = ${vendorId}`;
  return Response.json({ success: true });
}
