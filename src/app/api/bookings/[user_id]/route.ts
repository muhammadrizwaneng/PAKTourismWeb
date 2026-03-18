import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const userId = params.user_id;

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      package: {
        include: {
          destination: { select: { title: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(apiSuccess(bookings));
}
