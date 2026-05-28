// client/src/components/WalletManager.tsx
import { useState } from 'react';
import { Plus, Trash2, Wallet, Layers, Loader2, ShieldAlert } from 'lucide-react';

export interface WalletData {
  id: number;
  address: string;
  name: string;
  created_at?: string;
}

interface WalletManagerProps {
  wallets: WalletData[];
  activeWalletId: number | null;
  onSelectWallet: (wallet: WalletData) => void;
  onAddWallet: (address: string, name: string) => Promise<void>;
  onDeleteWallet: (id: number) => Promise<void>;
}

export function WalletManager({
  wallets,
  activeWalletId,
  onSelectWallet,
  onAddWallet,
  onDeleteWallet
}: WalletManagerProps) {
  const [newAddress, setNewAddress] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  const solanaRegex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$/;
  
  const cleanAddress = newAddress.trim();
  const cleanName = newName.trim() || 'Secondary Wallet';

  if (!solanaRegex.test(cleanAddress)) {
    setError('The wallet address does not have a valid Solana format.');
    return;
  }

  try {
    setLoading(true);
    await onAddWallet(cleanAddress, cleanName);
    setNewAddress('');
    setNewName('');
  } catch (err: any) {
    console.error("Server error:", err);
    console.error("Server error:", err);
    setError(err.response?.data?.message || err.message || 'Failed to add wallet.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-dark-card border border-gray-800 rounded-xl p-5 shadow-xl flex flex-col gap-5 h-full">
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <Layers className="w-5 h-5 text-solana-green" />
        <h2 className="text-lg font-bold text-gray-150">My Accounts Under Control</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            required
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Public address (Base58 Solana)..."
            className="w-full bg-black/40 border border-gray-800 focus:border-solana-green rounded-lg px-3 py-2 text-xs text-gray-150 placeholder-gray-600 outline-none transition-colors font-mono"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Optional label (e.g. Orca Bot)"
            className="flex-1 bg-black/40 border border-gray-800 focus:border-solana-green rounded-lg px-3 py-2 text-xs text-gray-150 placeholder-gray-600 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-solana-green hover:bg-emerald-500 text-black font-bold px-3 rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
        {error && (
          <p className="text-[11px] text-red-400 bg-red-950/20 border border-red-900/40 p-2 rounded-lg flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 shrink-0" />
            {error}
          </p>
        )}
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px] pr-1 scrollbar-thin">
        {wallets.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs border border-dashed border-gray-800 rounded-lg">
            You don't have any wallets registered for this user.
          </div>
        ) : (
          wallets.map((wallet) => {
            const isActive = wallet.id === activeWalletId;
            return (
              <div
                key={wallet.id}
                onClick={() => onSelectWallet(wallet)}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-solana-purple/10 border-solana-purple shadow-md shadow-solana-purple/5'
                    : 'bg-black/20 border-gray-800/80 hover:bg-gray-800/30 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Wallet className={`w-4 h-4 shrink-0 ${isActive ? 'text-solana-purple' : 'text-gray-500'}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-gray-100' : 'text-gray-300'}`}>
                      {wallet.name}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 truncate max-w-[160px] md:max-w-[200px]">
                      {wallet.address}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWallet(wallet.id);
                  }}
                  className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}