// server/src/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

// Route to register a user: POST /api/auth/register
router.post('/register', AuthController.register);

// Route to login: POST /api/auth/login
router.post('/login', AuthController.login);

export default router;