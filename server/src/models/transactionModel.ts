// server/src/models/transactionModel.ts
import { query } from '../config/db';

export interface WalletTransactionRecord {
  id?: number;
  wallet_id: number;
  signature: string;
  slot: number;
  amount: number;
  token_symbol?: string;
  tx_type: string;
  block_time: Date;
}

export const TransactionModel = {
  /**
   * Register transaction associated with a tracked wallet by ID
   */
  create: async (
    walletId: number, 
    signature: string, 
    slot: number, 
    amount: number, 
    txType: string, 
    blockTime: Date,
    tokenSymbol: string = 'SOL'
  ): Promise<WalletTransactionRecord | null> => {
    const text = `
      INSERT INTO wallet_transactions (wallet_id, signature, slot, amount, token_symbol, tx_type, block_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (signature) DO NOTHING
      RETURNING *;
    `;
    const values = [walletId, signature, slot, amount, tokenSymbol, txType, blockTime];
    const res = await query(text, values);
    return res.rows[0] || null;
  },

  /**
   * Get transaction history for a specific wallet
   * @param walletId Numeric ID of the wallet in the database
   * @param limit Number of records to return (default 50)
   */
  getByWalletId: async (walletId: number, limit: number = 50): Promise<WalletTransactionRecord[]> => {
    const text = `
      SELECT id, wallet_id, signature, slot, amount, token_symbol, tx_type, block_time
      FROM wallet_transactions
      WHERE wallet_id = $1
      ORDER BY block_time DESC
      LIMIT $2;
    `;
    const values = [walletId, limit];
    const res = await query(text, values);
    return res.rows;
  }
};