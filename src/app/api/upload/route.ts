import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(apiError('No file uploaded'), { status: 400 });
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    const imageUrl = await uploadImage(base64Image);

    return NextResponse.json(apiSuccess({ url: imageUrl }));
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
