import sql from '@/app/api/utils/sql';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const vendors = await sql`
    SELECT v.*, u.email FROM vendors v
    JOIN "user" u ON u.id = v."userId"
    WHERE v.slug = ${slug} AND v.status = 'active'
    LIMIT 1
  `;

  if (!vendors.length) {
    return Response.json({ error: 'Store not found' }, { status: 404 });
  }

  const vendor = vendors[0];

  const products = await sql`
    SELECT p.*, COALESCE(
      (SELECT json_agg(pi.url ORDER BY pi."sortOrder") FROM product_images pi WHERE pi."productId" = p.id),
      '[]'::json
    ) as images
    FROM products p
    WHERE p."vendorId" = ${vendor.id} AND p.status = 'active' AND p.stock > 0
    ORDER BY p."createdAt" DESC
  `;

  return Response.json({ vendor, products });
}
