import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/utils';
import { importKpTopAttractions } from '@/lib/kp-attractions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await importKpTopAttractions({
      limit: typeof body.limit === 'number' ? body.limit : undefined,
      maxPages: typeof body.maxPages === 'number' ? body.maxPages : undefined,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import KP attractions';
    return NextResponse.json(apiError(message), { status: 500 });
  }
}
