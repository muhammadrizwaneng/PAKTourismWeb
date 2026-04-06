import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPaginationParams, apiSuccess } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const { limit, skip, page } = getPaginationParams(searchParams);
  const destinationId = searchParams.get('destination_id');
  const city = searchParams.get('city');

  const where = {
    category: 'Fuel',
    ...(destinationId ? { destinationId: parseInt(destinationId) } : {}),
    ...(city
      ? { destination: { is: { city: { contains: city } } } }
      : {}),
  };

  const [pumps, total] = await Promise.all([
    prisma.pointOfInterest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        destination: { select: { id: true, title: true, slug: true, city: true, province: true } },
      },
    }),
    prisma.pointOfInterest.count({ where }),
  ]);

  return NextResponse.json(
    apiSuccess(pumps, { total, page, limit, totalPages: Math.ceil(total / limit) })
  );
}
