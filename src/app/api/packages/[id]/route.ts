import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json(apiError('Invalid ID'), { status: 400 });

  const pkg = await prisma.tourPackage.findUnique({
    where: { id },
    include: {
      destination: true,
      reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  if (!pkg) return NextResponse.json(apiError('Package not found', 404), { status: 404 });

  return NextResponse.json(apiSuccess(pkg));
}
