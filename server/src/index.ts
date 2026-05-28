import app from './app'; 
import dotenv from 'dotenv';
import { query, initDatabase } from './config/db';
import { SolanaService } from './services/solanaService';

dotenv.config();

const PORT = process.env.PORT || 5005;

app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await query('SELECT NOW()');
    res.status(200).json({
      status: 'online',
      databaseTime: dbResult.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : error
    });
  }
});

const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      
      const WALLET_TO_MONITOR = 'Hf87VkUDqYfsW6SAnbKSTg5N2Xm9PLe5K9W4W5pY7N24'; 
      const WALLET_ID_IN_DB = 4;
      SolanaService.subscribeToWallet(WALLET_TO_MONITOR, WALLET_ID_IN_DB);

      try {
        const dbWallets = await query('SELECT id, wallet_address FROM tracked_wallets', []);
        const extraWallets = dbWallets.rows.filter((w: any) => w.wallet_address !== WALLET_TO_MONITOR);
        
        extraWallets.forEach((wallet: any) => {
          SolanaService.subscribeToWallet(wallet.wallet_address, wallet.id);
        });
      } catch (dbError) {
        console.error('Failed to preload tracked wallets:', dbError);
      }
    });

  } catch (error) {
    console.error('Fatal: Could not start backend architecture', error);
    process.exit(1);
  }
};

startServer();