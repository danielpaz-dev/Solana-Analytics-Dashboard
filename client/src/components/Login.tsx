// client/src/components/Login.tsx
import { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, User, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

interface LoginProps {
  onAuthSuccess: (token: string, user: { id: number; username: string; email: string }) => void;
}

export function Login({ onAuthSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? 'register' : 'login';
    const payload = isRegister ? { username, email, password } : { email, password };

    try {
      const response = await axios.post(`http://localhost:5005/api/auth/${endpoint}`, payload);
      
      if (response.data) {
        const token = response.data.data?.token || response.data.token;
        const user = response.data.data?.user || response.data.user;

        if (token && user) {
          onAuthSuccess(token, user);
        } else {
          setError('The server did not return the expected credentials.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-card border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-solana-purple/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-solana-green/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-solana-purple to-solana-green rounded-xl flex items-center justify-center shadow-lg mb-3">
            <ShieldCheck className="w-6 h-6 text-black font-black" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-150">
            {isRegister ? 'Create Analyst Account' : 'Login to Dashboard'}
          </h2>
          <p className="text-gray-400 text-xs mt-1 text-center">
            {isRegister ? 'Register to monitor your own on-chain wallets' : 'Monitoring of cryptographic infrastructure and relational flows.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-950/40 border border-red-900/50 rounded-xl p-3 text-red-400 text-xs font-medium text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. daniel_dev"
                  className="w-full bg-black/40 border border-gray-800 focus:border-solana-purple rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-150 placeholder-gray-600 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-black/40 border border-gray-800 focus:border-solana-purple rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-150 placeholder-gray-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-gray-800 focus:border-solana-purple rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-150 placeholder-gray-600 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-solana-purple to-indigo-600 hover:from-solana-purple hover:to-indigo-500 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-solana-purple/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6 group"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isRegister ? 'Register' : 'Login'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="mt-6 text-center border-t border-gray-800/60 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-gray-400 hover:text-solana-green transition-colors cursor-pointer"
          >
            {isRegister ? 'Already have an account? Login here' : 'Don\'t have an account? Register for free'}
          </button>
        </div>

      </div>
    </div>
  );
}