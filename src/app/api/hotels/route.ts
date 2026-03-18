import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPaginationParams, apiSuccess } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const { limit, skip, page } = getPaginationParams(searchParams);
  const destinationId = searchParams.get('destination_id');
  const stars = searchParams.get('stars');

  const where = {
    ...(destinationId ? { destinationId: parseInt(destinationId) } : {}),
    ...(stars ? { starRating: parseInt(stars) } : {}),
  };

  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ starRating: 'desc' }, { createdAt: 'desc' }],
      include: { destination: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.hotel.count({ where }),
  ]);

  return NextResponse.json(
    apiSuccess(hotels, { total, page, limit, totalPages: Math.ceil(total / limit) })
  );
}
