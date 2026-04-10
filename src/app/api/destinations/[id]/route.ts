import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, parseJson } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json(apiError('Invalid ID'), { status: 400 });
  }

  const destination = await prisma.destination.findUnique({
    where: { id },
    include: {
      taxonomy: true,
      attractions: { include: { taxonomy: true } },
      hotels: true,
      packages: true,
      reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
      _count: { select: { attractions: true, hotels: true, packages: true, reviews: true } },
    },
  });

  if (!destination) {
    return NextResponse.json(apiError('Destination not found', 404), { status: 404 });
  }

  return NextResponse.json(
    apiSuccess({
      ...destination,
      galleryImages: parseJson<string[]>(destination.galleryImages, []),
      galleryVideos: parseJson(destination.galleryVideos, []),
    })
  );
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json(apiError('Invalid ID'), { status: 400 });
  }

  const existing = await prisma.destination.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(apiError('Destination not found', 404), { status: 404 });
  }

  await prisma.destination.delete({ where: { id } });

  return NextResponse.json(apiSuccess({ id }));
}
