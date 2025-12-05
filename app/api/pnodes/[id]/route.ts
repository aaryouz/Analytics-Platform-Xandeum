import { NextResponse } from 'next/server';
import { getSolanaClient } from '@/lib/solana-client';

/**
 * GET /api/pnodes/[id]
 * Retrieves a specific pNode by public key
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    const { id } = params;
    console.log(`[API /api/pnodes/${id}] Fetching pNode details`);

    const solanaClient = getSolanaClient();
    const pNode = await solanaClient.getPNodeByPublicKey(id);

    if (!pNode) {
      return NextResponse.json({
        ok: false,
        error: 'pNode not found',
      }, {
        status: 404,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`[API /api/pnodes/${id}] Successfully fetched in ${duration}ms`);

    return NextResponse.json({
      ok: true,
      data: pNode,
      metadata: {
        fetchedAt: new Date().toISOString(),
        durationMs: duration,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API /api/pnodes/${params.id}] Error:`, error);

    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pNode',
      metadata: {
        durationMs: duration,
      },
    }, {
      status: 500,
    });
  }
}
