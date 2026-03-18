import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UpdateDestinationSchema } from '@/lib/validations';
import { apiSuccess, apiError, slugify, toJson } from '@/lib/utils';
import { syncDataToJson } from '@/lib/sync/data-sync';

// GET /api/admin/destinations/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const destination = await prisma.destination.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!destination) return NextResponse.json(apiError('Destination not found'), { status: 404 });
    return NextResponse.json(apiSuccess(destination));
  } catch (error) {
    return NextResponse.json(apiError('Failed to fetch destination'), { status: 500 });
  }
}

// PUT /api/admin/destinations/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const validatedData = UpdateDestinationSchema.parse(body);

    const updateData: any = { ...validatedData };
    if (validatedData.title) {
        updateData.slug = slugify(validatedData.title);
    }
    if (validatedData.galleryImages) {
        updateData.galleryImages = toJson(validatedData.galleryImages);
    }

    const destination = await prisma.destination.update({
      where: { id },
      data: updateData,
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(destination));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(apiError(error.errors[0].message), { status: 400 });
    }
    return NextResponse.json(apiError('Failed to update destination'), { status: 500 });
  }
}

// DELETE /api/admin/destinations/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.destination.delete({ where: { id } });
    await syncDataToJson();
    return NextResponse.json(apiSuccess({ message: 'Deleted successfully' }));
  } catch (error: any) {
    return NextResponse.json(apiError('Failed to delete destination'), { status: 500 });
  }
}
