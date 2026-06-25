import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

async function getVendorId(userId: string): Promise<string | null> {
  const vendors = await sql`SELECT id FROM vendors WHERE "userId" = ${userId} LIMIT 1`;
  return vendors[0]?.id || null;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) {
    return Response.json({ products: [] });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  // Build dynamic query safely
  const conditions: string[] = [`p."vendorId" = $1`];
  const values: unknown[] = [vendorId];
  let paramIdx = 2;

  if (search) {
    conditions.push(
      `(LOWER(p.name) LIKE LOWER($${paramIdx}) OR LOWER(p.description) LIKE LOWER($${paramIdx}))`
    );
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (category) {
    conditions.push(`p.category = $${paramIdx}`);
    values.push(category);
    paramIdx++;
  }

  const whereClause = conditions.join(' AND ');

  const products = await sql(
    `
    SELECT p.*, COALESCE(
      (SELECT json_agg(pi.url ORDER BY pi."sortOrder") FROM product_images pi WHERE pi."productId" = p.id),
      '[]'::json
    ) as images
    FROM products p
    WHERE ${whereClause}
    ORDER BY p."createdAt" DESC
  `,
    values
  );

  return Response.json({ products });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) {
    return Response.json({ error: 'Vendor profile not found' }, { status: 404 });
  }

  const body = (await request.json()) as {
    name: string;
    description?: string;
    price: number;
    category?: string;
    stock?: number;
    images?: string[];
  };

  const { name, description, price, category, stock, images } = body;

  if (!name || !price) {
    return Response.json({ error: 'Name and price are required' }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO products ("vendorId", name, description, price, category, stock, status)
    VALUES (${vendorId}, ${name}, ${description || ''}, ${price}, ${category || ''}, ${stock || 0}, 'active')
    RETURNING *
  `;
  const product = result[0];

  // Insert images
  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      await sql`
        INSERT INTO product_images ("productId", url, "sortOrder") VALUES (${product.id}, ${images[i]}, ${i})
      `;
    }
  }

  return Response.json({ product }, { status: 201 });
}
