import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, slugify, toJson } from '@/lib/utils';
import { CreateHotelSchema } from '@/lib/validations';
import { syncDataToJson } from '@/lib/sync/data-sync';

// POST /api/admin/hotels
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateHotelSchema.parse(body);
    const slug = slugify(validatedData.title);

    const hotel = await prisma.hotel.create({
      data: {
        ...validatedData,
        slug,
        gallery: toJson(validatedData.gallery || []),
      },
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(hotel));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message || 'Failed to create hotel'), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const hotels = await prisma.hotel.findMany({
      include: { destination: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(apiSuccess(hotels));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
