// server/src/controllers/transactionController.ts
import { Request, Response } from 'express';
import { TransactionModel } from '../models/transactionModel';

export const TransactionController = {
  /**
   * GET /api/transactions/:walletId
   * Retrieve transaction history stored in DB for a wallet
   */
  getHistory: async (req: Request, res: Response): Promise<void> => {
    try {
      const { walletId } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 50;

      if (!walletId || isNaN(Number(walletId))) {
        res.status(400).json({ error: 'A valid numeric walletId is required.' });
        return;
      }

      const transactions = await TransactionModel.getByWalletId(Number(walletId), limit);
      
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error: any) {
      console.error(`[Transaction Controller Error]:`, error.message);
      res.status(500).json({ error: 'Internal Server Error consulting the history' });
    }
  }
};