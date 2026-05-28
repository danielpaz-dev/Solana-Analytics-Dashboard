// client/src/App.tsx
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Activity, ArrowUpRight, RefreshCw, Layers, BarChart3, LogOut, User as UserIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { Login } from './components/Login';
import { WalletManager } from './components/WalletManager';
import type { WalletData } from './components/WalletManager';

interface AnalyzedTx {
  id: number;
  signature: string;
  slot: number;
  amount: number;
  token_symbol: string;
  tx_type: string;
  block_time: string;
}

interface UserSession {
  id: number;
  username: string;
  email: string;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<UserSession | null>(
    localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')!) : null
  );

  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [activeWallet, setActiveWallet] = useState<WalletData | null>(null);

  const [transactions, setTransactions] = useState<AnalyzedTx[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = (newToken: string, userData: UserSession) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setWallets([]);
    setActiveWallet(null);
    setTransactions([]);
  };

  const fetchWallets = useCallback(async (tokenString: string) => {
    try {
      const response = await axios.get('http://localhost:5005/api/wallets', {
        headers: { Authorization: `Bearer ${tokenString}` }
      });
      
      // Flexible data extraction
      const walletList = response.data.data || response.data;
      if (Array.isArray(walletList)) {
        setWallets(walletList);

        if (walletList.length > 0 && !activeWallet) {
          setActiveWallet(walletList[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching wallets:', err);
    }
  }, [activeWallet]);

  const fetchTransactions = useCallback(async () => {
    if (!token || !activeWallet) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5005/api/transactions/${activeWallet.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const txData = response.data.data || response.data;
      if (Array.isArray(txData)) {
        setTransactions(txData);
      }
    } catch (err: any) {
      console.error(err);
      setError('Error fetching on-chain transactions.');
    } finally {
      setLoading(false);
    }
  }, [token, activeWallet]);

  const handleAddWallet = async (address: string, name: string) => {
    if (!token) return;
    try {
      const response = await axios.post(
        'http://localhost:5005/api/wallets',
        { address, name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const createdWallet = response.data.data || response.data;
      
      await fetchWallets(token);
      
      if (wallets.length === 0) {
        setActiveWallet(createdWallet);
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Server error registering wallet.');
    }
  };

  const handleDeleteWallet = async (id: number) => {
    if (!token) return;
    try {
      await axios.delete(`http://localhost:5005/api/wallets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (activeWallet?.id === id) {
        setActiveWallet(null);
        setTransactions([]);
      }
      
      setWallets(prev => prev.filter(w => w.id !== id));
    } catch (err: any) {
      console.error('Error deleting wallet:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWallets(token);
    }
  }, [token, fetchWallets]);

  useEffect(() => {
    if (token && activeWallet) {
      fetchTransactions();
    }
  }, [token, activeWallet, fetchTransactions]);


  if (!token || !user) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  const chartData = [...transactions].reverse().map((tx, index) => {
    const time = new Date(tx.block_time);
    return {
      name: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      Monto: tx.amount,
      Slot: tx.slot,
      index: index + 1
    };
  });

  const totalVolume = transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 p-6">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-solana-green to-solana-purple bg-clip-text text-transparent">
            Solana Real-Time Analytics
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-gray-300">
              <UserIcon className="w-3 h-3 text-solana-green" />
              Analyst: <span className="text-white">{user.username || (user as any).name || 'Daniel'}</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTransactions}
            disabled={!activeWallet || loading}
            className="flex items-center gap-2 bg-dark-card hover:bg-gray-800 border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 px-4 py-2 rounded-lg text-sm font-medium text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1">
          <WalletManager 
            wallets={wallets}
            activeWalletId={activeWallet?.id || null}
            onSelectWallet={(w) => setActiveWallet(w)}
            onAddWallet={handleAddWallet}
            onDeleteWallet={handleDeleteWallet}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-solana-green">Metrics</span>
                <Activity className="w-5 h-5 text-solana-green" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Cached transactions</h3>
                <p className="text-3xl font-black text-gray-100">{transactions.length}</p>
              </div>
            </div>

            <div className="bg-dark-card border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Volume</span>
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Total analyzed volume</h3>
                <p className="text-3xl font-black text-gray-100">
                  {totalVolume.toFixed(4)} <span className="text-lg font-normal text-gray-400">SOL</span>
                </p>
              </div>
            </div>
          </section>

          <div className="bg-dark-card border border-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active audit focus</h4>
              {activeWallet ? (
                <p className="text-xs font-mono text-solana-green truncate bg-black/30 p-2 rounded border border-gray-800/60 max-w-full">
                  [{activeWallet.name}] → {activeWallet.address}
                </p>
              ) : (
                <p className="text-xs text-gray-500 italic">Select or register a wallet on the left to start the analysis...</p>
              )}
            </div>
          </div>

        </div>

        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="bg-red-950/40 border border-red-900/50 text-red-400 text-xs p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <section className="bg-dark-card border border-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-solana-purple" />
              <h2 className="text-xl font-bold">History chart (Amount vs Time)</h2>
            </div>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500 text-sm italic border border-dashed border-gray-800 rounded-xl">
                Insufficient data accumulated to plot this wallet's chart.
              </div>
            ) : (
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9945FF" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#9945FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222c37" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151a20', borderColor: '#374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#9945FF', fontWeight:"bold" }}
                      itemStyle={{ color: '#14F195' }}
                    />
                    <Area type="monotone" dataKey="Monto" stroke="#9945FF" strokeWidth={2} fillOpacity={1} fill="url(#colorMonto)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="bg-dark-card border border-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-solana-green" />
              <h2 className="text-xl font-bold">Operations History</h2>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500 italic">No records saved.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                      <th className="pb-3">Signature</th>
                      <th className="pb-3 text-center">Slot</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-right">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors group">
                        <td className="py-3 font-mono text-xs text-solana-purple max-w-[200px] truncate">
                          <a href={`https://explorer.solana.com/tx/${tx.signature}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-gray-300 group-hover:text-solana-green">
                            {tx.signature}
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="py-3 text-center text-xs text-gray-400">{tx.slot}</td>
                        <td className="py-3 text-right font-semibold text-gray-200">{tx.amount} <span className="text-xs text-gray-400">{tx.token_symbol}</span></td>
                        <td className="py-3 text-right">
                          <span className="inline-block bg-solana-purple/10 text-solana-purple text-[10px] font-bold px-2 py-0.5 rounded border border-solana-purple/20">{tx.tx_type}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

      </main>
    </div>
  );
}

export default App;