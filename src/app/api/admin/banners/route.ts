import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/utils';
import { CreateBannerSchema } from '@/lib/validations';
import { syncDataToJson } from '@/lib/sync/data-sync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateBannerSchema.parse(body);

    const banner = await prisma.banner.create({
      data: validated,
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(banner));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(apiSuccess(banners));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
