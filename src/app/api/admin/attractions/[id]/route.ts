import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/utils';
import { CreateAttractionSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { syncDataToJson } from '@/lib/sync/data-sync';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const validated = CreateAttractionSchema.partial().parse(body);

    const data: any = { ...validated };
    if (validated.title) data.slug = slugify(validated.title);
    if (validated.gallery) data.gallery = JSON.stringify(validated.gallery);

    const attraction = await prisma.attraction.update({
      where: { id },
      data
    });

    await syncDataToJson();

    return NextResponse.json(apiSuccess(attraction));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.attraction.delete({ where: { id } });
    await syncDataToJson();
    return NextResponse.json(apiSuccess({ message: 'Deleted successfully' }));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const attraction = await prisma.attraction.findUnique({
      where: { id },
      include: { destination: true, taxonomy: true }
    });
    
    if (!attraction) {
      return NextResponse.json(apiError('Attraction not found'), { status: 404 });
    }

    return NextResponse.json(apiSuccess(attraction));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
