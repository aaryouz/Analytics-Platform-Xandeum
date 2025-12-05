import { NextResponse } from 'next/server';
import { getSolanaClient } from '@/lib/solana-client';
import type { PNode } from '@/lib/types';

/**
 * GET /api/pnodes
 * Retrieves all pNode accounts from Solana blockchain
 *
 * NASA-quality: Comprehensive error handling, logging, and monitoring
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    console.log('[API /api/pnodes] Fetching all pNodes from Solana blockchain');

    const solanaClient = getSolanaClient();

    // Get all pNodes from blockchain
    const pNodes: PNode[] = await solanaClient.getAllPNodes();

    const duration = Date.now() - startTime;
    console.log(`[API /api/pnodes] Successfully fetched ${pNodes.length} pNodes in ${duration}ms`);

    return NextResponse.json({
      ok: true,
      data: pNodes,
      metadata: {
        count: pNodes.length,
        fetchedAt: new Date().toISOString(),
        durationMs: duration,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[API /api/pnodes] Error fetching pNodes:', error);

    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pNodes',
      metadata: {
        durationMs: duration,
      },
    }, {
      status: 500,
    });
  }
}

/**
 * Health check endpoint
 */
export async function HEAD() {
  try {
    const solanaClient = getSolanaClient();
    const isHealthy = await solanaClient.healthCheck();

    if (isHealthy) {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 503 });
    }
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
