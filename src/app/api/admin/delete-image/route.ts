import { NextRequest, NextResponse } from 'next/server';
import { deleteImage } from '@/lib/cloudinary';
import { apiSuccess, apiError } from '@/lib/utils';

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(apiError('Missing image URL'), { status: 400 });
    }

    // Only delete images hosted on Cloudinary
    if (!url.includes('res.cloudinary.com')) {
      return NextResponse.json(apiSuccess({ message: 'Not a Cloudinary image, skipped' }));
    }

    await deleteImage(url);

    return NextResponse.json(apiSuccess({ message: 'Image deleted from Cloudinary' }));
  } catch (error: any) {
    console.error('Delete image error:', error);
    return NextResponse.json(apiError(error.message || 'Failed to delete image'), { status: 500 });
  }
}
