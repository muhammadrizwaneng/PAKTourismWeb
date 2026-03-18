import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CreateReviewSchema } from '@/lib/validations';
import { apiSuccess, apiError, getPaginationParams } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const { limit, skip, page } = getPaginationParams(searchParams);
  const destinationId = searchParams.get('destination_id');
  const hotelId = searchParams.get('hotel_id');
  const packageId = searchParams.get('package_id');

  const where = {
    ...(destinationId ? { destinationId: parseInt(destinationId) } : {}),
    ...(hotelId ? { hotelId: parseInt(hotelId) } : {}),
    ...(packageId ? { packageId: parseInt(packageId) } : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json(
    apiSuccess(reviews, { total, page, limit, totalPages: Math.ceil(total / limit) })
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateReviewSchema.parse(body);

    const review = await prisma.review.create({
      data: validatedData,
    });

    // Update rating if linked to something (simple average logic could be added later)
    
    return NextResponse.json(apiSuccess(review));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(apiError(error.errors[0].message), { status: 400 });
    }
    return NextResponse.json(apiError('Failed to create review'), { status: 500 });
  }
}
