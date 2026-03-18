import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/utils';
import { CreateGuideSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';

import { syncDataToJson } from '@/lib/sync/data-sync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateGuideSchema.parse(body);
    const slug = slugify(validated.name);

    const guide = await prisma.tourGuide.create({
      data: {
        ...validated,
        slug,
        languages: validated.languages ? JSON.stringify(validated.languages) : undefined,
      }
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(guide));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const guides = await prisma.tourGuide.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(apiSuccess(guides));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
