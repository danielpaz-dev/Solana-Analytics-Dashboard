// server/src/routes/walletRoutes.ts
import { Router } from 'express';
import { addWallet, getWallets, deleteWallet } from '../controllers/walletController';
import authMiddleware from '../middlewares/authMiddleware'; 

const router = Router();

router.use(authMiddleware as any);

router.post('/', addWallet as any);
router.get('/', getWallets as any);
router.delete('/:id', deleteWallet as any);

export default router;