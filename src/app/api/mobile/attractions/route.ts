import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, getPaginationParams, parseJson } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get('q')?.trim();
  const destinationId = searchParams.get('destination_id');
  const province = searchParams.get('province')?.trim();

  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { destination: { title: { contains: search } } },
          ],
        }
      : {}),
    ...(destinationId ? { destinationId: parseInt(destinationId, 10) } : {}),
    ...(province ? { destination: { province: { equals: province } } } : {}),
  };

  const [attractions, total] = await Promise.all([
    prisma.attraction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
      },
    }),
    prisma.attraction.count({ where }),
  ]);

  const data = attractions.map((attraction) => {
    const gallery = parseJson<string[]>(attraction.gallery, []);
    return {
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
    };
  });

  return NextResponse.json(
    apiSuccess(data, { total, page, limit, totalPages: Math.ceil(total / limit) })
  );
}
