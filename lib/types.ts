// pNode Data Interface (inferred from xandminer source code analysis)
export interface PNode {
  publicKey: string;          // Base58 Solana public key
  registered: boolean;        // Registration status
  transactionHash?: string;   // Registration tx

  // On-chain data (from program account)
  stake: number;             // $XAND tokens staked
  commission: number;        // Commission rate (%)
  status: 'active' | 'inactive' | 'unknown';

  // Performance metrics (from individual APIs - optional)
  networkSpeed?: {
    download: number;        // Mbps
    upload: number;          // Mbps
  };
  serverInfo?: {
    ip: string;
    hostname: string;
  };
  versions?: {
    xandminerd: string;
    pod: string;
  };
  storage?: {
    total: number;
    available: number;
    dedicated: number;
  };

  // Metadata
  lastUpdated?: Date;
  accountDataRaw?: Buffer;   // Raw account data for debugging
}

// API Response types
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// pNode filters for list view
export interface PNodeFilters {
  status?: 'active' | 'inactive' | 'all';
  minStake?: number;
  maxCommission?: number;
  search?: string;
}

// Sort options
export type SortField = 'stake' | 'commission' | 'publicKey';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
