import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, slugify } from '@/lib/utils';
import { CreateGuideSchema } from '@/lib/validations';
import { syncDataToJson } from '@/lib/sync/data-sync';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const validated = CreateGuideSchema.partial().parse(body);
    
    const data: any = { ...validated };
    if (validated.name) data.slug = slugify(validated.name);
    if (validated.languages) data.languages = JSON.stringify(validated.languages);

    const guide = await prisma.tourGuide.update({
      where: { id },
      data
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(guide));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.tourGuide.delete({ where: { id } });
    await syncDataToJson();
    return NextResponse.json(apiSuccess({ message: 'Deleted successfully' }));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
