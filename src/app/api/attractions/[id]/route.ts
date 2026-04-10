import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiError, apiSuccess, parseJson } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json(apiError('Invalid attraction ID'), { status: 400 });
  }

  const attraction = await prisma.attraction.findUnique({
    where: { id },
    include: {
      destination: {
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          province: true,
          featuredImage: true,
        },
      },
      taxonomy: true,
      pointsOfInterest: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!attraction) {
    return NextResponse.json(apiError('Attraction not found', 404), { status: 404 });
  }

  const data = {
    ...attraction,
    gallery: parseJson<string[]>(attraction.gallery, []),
    pointsOfInterest: attraction.pointsOfInterest.map((poi) => ({
      ...poi,
      gallery: parseJson<string[]>(poi.gallery, []),
    })),
  };

  return NextResponse.json(apiSuccess(data));
}
