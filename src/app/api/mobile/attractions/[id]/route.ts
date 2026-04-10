import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiError, apiSuccess, parseJson } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);

  if (Number.isNaN(id)) {
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
          latitude: true,
          longitude: true,
        },
      },
      taxonomy: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      pointsOfInterest: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!attraction) {
    return NextResponse.json(apiError('Attraction not found', 404), { status: 404 });
  }

  const gallery = parseJson<string[]>(attraction.gallery, []);

  const data = {
    id: attraction.id,
    title: attraction.title,
    slug: attraction.slug,
    description: attraction.description,
    entryFee: attraction.entryFee,
    timings: attraction.timings,
    gallery,
    coverImage: gallery[0] ?? attraction.destination.featuredImage,
    destination: attraction.destination,
    taxonomy: attraction.taxonomy,
    pointsOfInterest: attraction.pointsOfInterest.map((poi) => ({
      ...poi,
      gallery: parseJson<string[]>(poi.gallery, []),
    })),
  };

  return NextResponse.json(apiSuccess(data));
}
