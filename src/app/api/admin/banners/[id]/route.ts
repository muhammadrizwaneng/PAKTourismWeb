import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/utils';
import { CreateBannerSchema } from '@/lib/validations';
import { syncDataToJson } from '@/lib/sync/data-sync';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const validated = CreateBannerSchema.partial().parse(body);

    const banner = await prisma.banner.update({
      where: { id },
      data: validated,
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(banner));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.banner.delete({ where: { id } });
    await syncDataToJson();
    return NextResponse.json(apiSuccess({ message: 'Deleted successfully' }));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
