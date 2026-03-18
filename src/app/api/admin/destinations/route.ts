import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CreateDestinationSchema, UpdateDestinationSchema } from '@/lib/validations';
import { apiSuccess, apiError, slugify, toJson } from '@/lib/utils';

// GET /api/admin/destinations
export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });
    return NextResponse.json(apiSuccess(destinations));
  } catch (error) {
    return NextResponse.json(apiError('Failed to fetch destinations'), { status: 500 });
  }
}

import { syncDataToJson } from '@/lib/sync/data-sync';

// POST /api/admin/destinations
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateDestinationSchema.parse(body);

    const destination = await prisma.destination.create({
      data: {
        ...validatedData,
        slug: slugify(validatedData.title),
        galleryImages: toJson(validatedData.galleryImages || []),
      },
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(destination));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(apiError(error.errors[0].message), { status: 400 });
    }
    return NextResponse.json(apiError('Failed to create destination'), { status: 500 });
  }
}
