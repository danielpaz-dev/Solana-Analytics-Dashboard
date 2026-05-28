// server/src/routes/transactionRoutes.ts
import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';

const router = Router();

// Route to get transaction history by wallet ID
router.get('/:walletId', TransactionController.getHistory);

export default router;