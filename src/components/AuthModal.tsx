import React, { useState } from 'react';
import { User, Lock, Mail, ShieldAlert, Sparkles, X, Check } from 'lucide-react';
import { api } from '../services/api.ts';
import { User as UserType } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regAvatar, setRegAvatar] = useState('pilot_cyan');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const data = await api.login(identifier, password);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const data = await api.register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        displayName: regDisplayName || regUsername,
        avatar: regAvatar,
      });
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click test credentials
  const fillQuickCredentials = (userType: 'pilot' | 'admin') => {
    if (userType === 'pilot') {
      setIdentifier('player@skyrush.demo');
      setPassword('Player2026!');
    } else {
      setIdentifier('admin@skyrush.demo');
      setPassword('DemoAdmin2026!');
    }
    setTab('login');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              tab === 'login'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              tab === 'register'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Demo Pilot
          </button>
        </div>

        {/* Quick Demo Pilot selector */}
        <div className="mb-5 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>1-Click Test Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickCredentials('pilot')}
              className="py-1.5 px-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-left"
            >
              <div className="font-bold text-cyan-400">Demo Pilot</div>
              <div className="text-[10px] text-slate-500 font-mono">1,000 V$ Starting</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin')}
              className="py-1.5 px-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-rose-500/40 text-slate-300 hover:text-white transition-all text-left"
            >
              <div className="font-bold text-rose-400">Admin Account</div>
              <div className="text-[10px] text-slate-500 font-mono">Full Console Access</div>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Username or Email</label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5">
                <Mail className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. player@skyrush.demo"
                  className="w-full bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Password</label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5">
                <Lock className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Verifying...' : 'Sign In To SkyRush'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Pilot Callsign (Username)</label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. Maverick"
                  className="w-full bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Display Name</label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type="text"
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                  placeholder="e.g. Pete Mitchell"
                  className="w-full bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Email Address</label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <Mail className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="pilot@demo.local"
                  className="w-full bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Password</label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <Lock className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Select Squad Helmet</label>
              <div className="flex items-center gap-3">
                {['pilot_cyan', 'pilot_purple', 'pilot_red', 'pilot_amber'].map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setRegAvatar(av)}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                      regAvatar === av
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
                        : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${regAvatar === av ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Creating Account...' : 'Register & Claim 1,000 V$ Bonus'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
