import { PublicKey } from '@solana/web3.js';

// Solana Program Addresses (from xandminer CONSTS.ts)
export const PNODE_PROGRAM = new PublicKey('3hMZVwdgRHYSyqkdK3Y8MdZzNwLkjzXod1XrKcniXw56');
export const XAND_MINT = new PublicKey('XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx');
export const FEE_DEPOSIT_ACC = new PublicKey('82m8SFM5ggHrCQYbD8nC8HxWRx4YHRR7RQAdeC8RNtyX');
export const REFUNDABLE_DEPOSIT_ACC = new PublicKey('FaWhmBgWevoJGcJyrx7CHaf6WNduMjEBb6WQEccSVp6Z');

// RPC Endpoints
export const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com';

// Application constants
export const APP_NAME = 'Xandeum pNode Analytics';
export const APP_DESCRIPTION = 'Real-time analytics platform for Xandeum pNodes';
