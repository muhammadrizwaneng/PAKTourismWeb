import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CreateBookingSchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateBookingSchema.parse(body);

    const pkg = await prisma.tourPackage.findUnique({
      where: { id: validatedData.packageId },
    });

    if (!pkg) {
      return NextResponse.json(apiError('Package not found', 404), { status: 404 });
    }

    const totalPrice = pkg.price * validatedData.numPeople;

    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        travelDate: new Date(validatedData.travelDate),
        totalPrice,
        status: 'pending',
      },
    });

    return NextResponse.json(apiSuccess(booking));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(apiError(error.errors[0].message), { status: 400 });
    }
    return NextResponse.json(apiError('Failed to create booking'), { status: 500 });
  }
}
