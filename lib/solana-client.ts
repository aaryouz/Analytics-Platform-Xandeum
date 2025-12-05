import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import { PNODE_PROGRAM, SOLANA_RPC_ENDPOINT } from './constants';
import { PNode } from './types';

/**
 * Solana RPC Client with circuit breaker pattern and retry logic
 * NASA-quality: Handles failures gracefully, logs all operations
 */
export class SolanaClient {
  private connection: Connection;
  private failureCount: number = 0;
  private readonly maxFailures: number = 3;
  private circuitOpen: boolean = false;
  private lastFailureTime: number = 0;
  private readonly resetTimeout: number = 60000; // 1 minute

  constructor(endpoint: string = SOLANA_RPC_ENDPOINT) {
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitOpen(): boolean {
    if (!this.circuitOpen) return false;

    // Auto-reset circuit breaker after timeout
    if (Date.now() - this.lastFailureTime > this.resetTimeout) {
      console.log('[SolanaClient] Circuit breaker reset');
      this.circuitOpen = false;
      this.failureCount = 0;
      return false;
    }

    return true;
  }

  /**
   * Record failure for circuit breaker
   */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.maxFailures) {
      console.error('[SolanaClient] Circuit breaker opened due to repeated failures');
      this.circuitOpen = true;
    }
  }

  /**
   * Reset circuit breaker on success
   */
  private recordSuccess(): void {
    if (this.failureCount > 0) {
      console.log('[SolanaClient] Operation successful, resetting failure count');
    }
    this.failureCount = 0;
    this.circuitOpen = false;
  }

  /**
   * Get all pNode accounts from Solana blockchain
   * This is the PRIMARY method for discovering all pNodes
   */
  async getAllPNodes(): Promise<PNode[]> {
    if (this.isCircuitOpen()) {
      throw new Error('Circuit breaker is open. Too many recent failures.');
    }

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[SolanaClient] Fetching pNodes (attempt ${attempt}/${maxRetries})`);

        const accounts = await this.connection.getProgramAccounts(PNODE_PROGRAM, {
          commitment: 'confirmed',
        });

        console.log(`[SolanaClient] Found ${accounts.length} pNode accounts`);

        const pNodes = accounts.map((account) => this.parsePNodeAccount(account));

        this.recordSuccess();
        return pNodes;

      } catch (error) {
        lastError = error as Error;
        console.error(`[SolanaClient] Attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`[SolanaClient] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.recordFailure();
    throw new Error(`Failed to fetch pNodes after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Get a specific pNode account by public key
   */
  async getPNodeByPublicKey(publicKey: string): Promise<PNode | null> {
    if (this.isCircuitOpen()) {
      throw new Error('Circuit breaker is open. Too many recent failures.');
    }

    try {
      const pubKey = new PublicKey(publicKey);
      const accountInfo = await this.connection.getAccountInfo(pubKey, 'confirmed');

      if (!accountInfo) {
        console.log(`[SolanaClient] No account found for ${publicKey}`);
        return null;
      }

      const pNode = this.parsePNodeAccount({
        pubkey: pubKey,
        account: accountInfo,
      });

      this.recordSuccess();
      return pNode;

    } catch (error) {
      console.error(`[SolanaClient] Error fetching pNode ${publicKey}:`, error);
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Parse pNode account data
   * TODO: Implement proper deserialization based on program schema
   * Currently returns placeholder data structure
   */
  private parsePNodeAccount(account: {
    pubkey: PublicKey;
    account: AccountInfo<Buffer>;
  }): PNode {
    // TODO: Implement actual account data deserialization
    // For now, we'll return a structured object with placeholder data
    // In production, this would parse the account.data buffer according to the program's schema

    const accountData = account.account.data;

    // Placeholder parsing - replace with actual schema deserialization
    return {
      publicKey: account.pubkey.toBase58(),
      registered: true,
      stake: 0, // Parse from accountData
      commission: 0, // Parse from accountData
      status: 'unknown',
      lastUpdated: new Date(),
      accountDataRaw: accountData,
    };
  }

  /**
   * Health check - verify connection is working
   */
  async healthCheck(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      console.log('[SolanaClient] Health check passed. Solana version:', version);
      return true;
    } catch (error) {
      console.error('[SolanaClient] Health check failed:', error);
      return false;
    }
  }

  /**
   * Get connection for direct access if needed
   */
  getConnection(): Connection {
    return this.connection;
  }
}

// Singleton instance
let solanaClientInstance: SolanaClient | null = null;

export function getSolanaClient(): SolanaClient {
  if (!solanaClientInstance) {
    solanaClientInstance = new SolanaClient();
  }
  return solanaClientInstance;
}
