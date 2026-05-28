// server/src/app.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';
import transactionRoutes from './routes/transactionRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Mapeo limpio de rutas en la misma instancia
app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);

export default app;