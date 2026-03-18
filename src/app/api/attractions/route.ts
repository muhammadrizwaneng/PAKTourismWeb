import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPaginationParams, apiSuccess } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const { limit, skip, page } = getPaginationParams(searchParams);
  const destinationId = searchParams.get('destination_id');
  const taxonomyId = searchParams.get('taxonomyId');

  const where = {
    ...(destinationId ? { destinationId: parseInt(destinationId) } : {}),
    ...(taxonomyId ? { taxonomyId: parseInt(taxonomyId) } : {}),
  };

  const [attractions, total] = await Promise.all([
    prisma.attraction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { destination: { select: { id: true, title: true, slug: true } }, taxonomy: true },
    }),
    prisma.attraction.count({ where }),
  ]);

  return NextResponse.json(
    apiSuccess(attractions, { total, page, limit, totalPages: Math.ceil(total / limit) })
  );
}
