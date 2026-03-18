import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess } from '@/lib/utils';

export async function GET(_req: NextRequest) {
  const guides = await prisma.tourGuide.findMany({
    orderBy: [{ rating: 'desc' }, { name: 'asc' }],
  });
  return NextResponse.json(apiSuccess(guides));
}
