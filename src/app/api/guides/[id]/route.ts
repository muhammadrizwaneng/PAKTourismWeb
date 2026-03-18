import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json(apiError('Invalid ID'), { status: 400 });

  const guide = await prisma.tourGuide.findUnique({ where: { id } });
  if (!guide) return NextResponse.json(apiError('Guide not found', 404), { status: 404 });

  return NextResponse.json(apiSuccess(guide));
}
