import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/utils';
import { CreateAttractionSchema } from '@/lib/validations';
import { slugify, toJson } from '@/lib/utils';
import { syncDataToJson } from '@/lib/sync/data-sync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateAttractionSchema.parse(body);
    const slug = slugify(validated.title);

    const attraction = await prisma.attraction.upsert({
      where: { slug },
      update: {
        ...validated,
        gallery: validated.gallery ? JSON.stringify(validated.gallery) : undefined,
      },
      create: {
        ...validated,
        slug,
        gallery: validated.gallery ? JSON.stringify(validated.gallery) : undefined,
      },
      include: { destination: true, taxonomy: true }
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(attraction));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(apiError(error.errors[0].message), { status: 400 });
    }
    return NextResponse.json(apiError(error.message || 'Failed to process attraction'), { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const attractions = await prisma.attraction.findMany({
      include: { destination: true, taxonomy: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(apiSuccess(attractions));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
