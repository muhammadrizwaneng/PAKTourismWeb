import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPaginationParams, apiSuccess } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const { limit, skip, page } = getPaginationParams(searchParams);
  const province = searchParams.get('province');
  const featured = searchParams.get('featured');
  const taxonomyId = searchParams.get('taxonomyId');
  const search = searchParams.get('search');

  const where = {
    ...(province ? { province } : {}),
    ...(featured === 'true' ? { isFeatured: true } : {}),
    ...(taxonomyId ? { taxonomyId: parseInt(taxonomyId) } : {}),
    ...(search ? { title: { contains: search } } : {}),
  };

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        taxonomy: true,
        _count: { select: { attractions: true, hotels: true, packages: true } },
      },
    }),
    prisma.destination.count({ where }),
  ]);

  return NextResponse.json(
    apiSuccess(destinations, { total, page, limit, totalPages: Math.ceil(total / limit) })
  );
}
