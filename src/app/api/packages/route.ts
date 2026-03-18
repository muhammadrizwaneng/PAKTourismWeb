import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPaginationParams, apiSuccess } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const { limit, skip, page } = getPaginationParams(searchParams);
  const destinationId = searchParams.get('destination_id');
  const featured = searchParams.get('featured');
  const maxPrice = searchParams.get('max_price');
  const minPrice = searchParams.get('min_price');

  const where = {
    ...(destinationId ? { destinationId: parseInt(destinationId) } : {}),
    ...(featured === 'true' ? { isFeatured: true } : {}),
    ...(maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {}),
    ...(minPrice ? { price: { gte: parseFloat(minPrice) } } : {}),
  };

  const [packages, total] = await Promise.all([
    prisma.tourPackage.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { destination: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.tourPackage.count({ where }),
  ]);

  return NextResponse.json(
    apiSuccess(packages, { total, page, limit, totalPages: Math.ceil(total / limit) })
  );
}
