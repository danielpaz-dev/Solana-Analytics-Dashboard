import { Response } from 'express';
import { WalletModel } from '../models/walletModel';
import { SolanaService } from '../services/solanaService';

export const addWallet = async (req: any, res: Response) => {
  const { address, name } = req.body;
  const userId = req.user.id;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ message: 'Wallet address is required' });
  }

  const cleanAddress = address.trim();
  const cleanLabel = name ? name.trim() : 'Wallet';

  if (cleanAddress.length < 32 || cleanAddress.length > 44) {
    return res.status(400).json({ 
      message: 'Solana address must be between 32 and 44 characters.' 
    });
  }

  try {
    const newWallet = await WalletModel.create(userId, cleanAddress, cleanLabel);
    SolanaService.subscribeToWallet(newWallet.address, newWallet.id);

    return res.status(201).json({
      message: 'Wallet registered successfully',
      data: newWallet
    });
  } catch (error) {
    console.error('Error [addWallet]:', error);
    return res.status(500).json({ 
      message: 'Internal error registering the wallet.' 
    });
  }
};

export const getWallets = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const wallets = await WalletModel.findByUserId(userId);
    return res.status(200).json({ data: wallets });
  } catch (error) {
    console.error('Error [getWallets]:', error);
    return res.status(500).json({ 
      message: 'Internal error retrieving the list of wallets.' 
    });
  }
};

export const deleteWallet = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const success = await WalletModel.delete(Number(id), userId);

    if (!success) {
      return res.status(404).json({ 
        message: 'Wallet not found or unauthorized.' 
      });
    }

    return res.status(200).json({
      message: 'Wallet removed successfully'
    });
  } catch (error) {
    console.error('Error [deleteWallet]:', error);
    return res.status(500).json({ 
      message: 'Internal error while attempting to delete the wallet.' 
    });
  }
};