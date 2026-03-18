import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess } from '@/lib/utils';

export async function GET(_req: NextRequest) {
  const taxonomies = await prisma.taxonomy.findMany({
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json(apiSuccess(taxonomies));
}
