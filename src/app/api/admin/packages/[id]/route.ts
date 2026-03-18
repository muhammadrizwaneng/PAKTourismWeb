import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, slugify } from '@/lib/utils';
import { CreatePackageSchema } from '@/lib/validations';
import { syncDataToJson } from '@/lib/sync/data-sync';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const validated = CreatePackageSchema.partial().parse(body);
    
    const data: any = { ...validated };
    if (validated.title) data.slug = slugify(validated.title);
    if (validated.gallery) data.gallery = JSON.stringify(validated.gallery);
    if (validated.includes) data.includes = JSON.stringify(validated.includes);
    if (validated.excludes) data.excludes = JSON.stringify(validated.excludes);

    const pkg = await prisma.tourPackage.update({
      where: { id },
      data
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(pkg));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.tourPackage.delete({ where: { id } });
    await syncDataToJson();
    return NextResponse.json(apiSuccess({ message: 'Deleted successfully' }));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
