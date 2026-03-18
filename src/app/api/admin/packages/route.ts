import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, slugify } from '@/lib/utils';
import { CreatePackageSchema } from '@/lib/validations';
import { syncDataToJson } from '@/lib/sync/data-sync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreatePackageSchema.parse(body);
    const slug = slugify(validated.title);

    const pkg = await prisma.tourPackage.create({
      data: {
        ...validated,
        slug,
        gallery: validated.gallery ? JSON.stringify(validated.gallery) : undefined,
        includes: validated.includes ? JSON.stringify(validated.includes) : undefined,
        excludes: validated.excludes ? JSON.stringify(validated.excludes) : undefined,
      },
      include: { destination: true }
    });

    await syncDataToJson();
    return NextResponse.json(apiSuccess(pkg));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const packages = await prisma.tourPackage.findMany({
      include: { destination: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(apiSuccess(packages));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
