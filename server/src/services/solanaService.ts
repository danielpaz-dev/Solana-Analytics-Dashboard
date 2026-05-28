import { Connection, PublicKey } from '@solana/web3.js';
import { TransactionModel } from '../models/transactionModel';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

const activeIntervals = new Map<string, NodeJS.Timeout>();

export const SolanaService = {
  getWalletBalance: async (walletAddress: string): Promise<number> => {
    try {
      const publicKey = new PublicKey(walletAddress);
      const lamports = await connection.getBalance(publicKey);
      return lamports / 1_000_000_000;
    } catch (error) {
      return Number((Math.random() * (50 - 10) + 10).toFixed(4));
    }
  },

  subscribeToWallet: (walletAddress: string, walletId: number) => {
    if (activeIntervals.has(walletAddress)) return;

    let currentSlot = 164014061;
    const txTypes = ['JUPITER_SWAP', 'RAYDIUM_POOL', 'ORCA_WHIRLPOOL', 'SYSTEM_TRANSFER'];

    const intervalId = setInterval(async () => {
      try {
        const finalAmount = Number((Math.random() * (4.5 - 0.1) + 0.1).toFixed(4));
        const txType = txTypes[Math.floor(Math.random() * txTypes.length)];
        currentSlot += Math.floor(Math.random() * 5) + 1;

        const randomHash = [...Array(12)].map(() => Math.random().toString(36)[2]).join('');
        const fakeSignature = `3PfFakeTxSignature${randomHash}Xyz`;

        await TransactionModel.create(
          walletId,
          fakeSignature,
          currentSlot,
          finalAmount,
          txType,
          new Date(),
          'SOL'
        );

      } catch (err: any) {
        console.error(`Service Error [subscribeToWallet]:`, err.message);
      }
    }, 3000);

    activeIntervals.set(walletAddress, intervalId);
  },

  unsubscribeFromWallet: (walletAddress: string) => {
    const intervalId = activeIntervals.get(walletAddress);
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      activeIntervals.delete(walletAddress);
    }
  }
};