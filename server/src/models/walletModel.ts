// server/src/models/walletModel.ts
import { query } from '../config/db';

// 💡 Update the return interface to use client format
export interface TrackedWallet {
  id: number;
  user_id: number;
  address: string; // Refleja wallet_address AS address
  name: string;    // Refleja label AS name
  created_at: Date;
}

export const WalletModel = {
  /**
   * Link a new wallet to the user in the database
   */
  create: async (userId: number, walletAddress: string, label?: string): Promise<TrackedWallet> => {
    // 💡 Use alias in the RETURNING to return the structure that React expects
    const text = `
      INSERT INTO tracked_wallets (user_id, wallet_address, label)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, wallet_address AS address, label AS name, created_at;
    `;
    const values = [userId, walletAddress, label || null];
    const res = await query(text, values);
    return res.rows[0];
  },

  /**
   * Get all wallets under the radar of a specific user
   */
  findByUserId: async (userId: number): Promise<TrackedWallet[]> => {
    // 💡 Renombramos los campos en el SELECT
    const text = `
      SELECT id, user_id, wallet_address AS address, label AS name, created_at 
      FROM tracked_wallets 
      WHERE user_id = $1 
      ORDER BY created_at DESC;
    `;
    const res = await query(text, [userId]);
    return res.rows;
  },

  /**
   * Delete a wallet from tracking ensuring it belongs to the user
   */
  delete: async (id: number, userId: number): Promise<boolean> => {
    const text = 'DELETE FROM tracked_wallets WHERE id = $1 AND user_id = $2 RETURNING id;';
    const res = await query(text, [id, userId]);
    return res.rowCount ? res.rowCount > 0 : false;
  }
};