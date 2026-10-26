import React from 'react';
import { Volume2, VolumeX, Plus, ShieldCheck, User as UserIcon, LogOut, Play } from 'lucide-react';
import { User } from '../types/index.ts';
import { soundManager } from '../services/audio.ts';

interface HeaderProps {
  user: User | null;
  activeTab: 'game' | 'leaderboard' | 'admin' | 'tests';
  setActiveTab: (tab: 'game' | 'leaderboard' | 'admin' | 'tests') => void;
  onOpenAuth: () => void;
  onOpenWallet: () => void;
  onOpenHowToPlay: () => void;
  onLogout: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenWallet,
  onOpenHowToPlay,
  onLogout,
  isMuted,
  setIsMuted,
}) => {
  const handleToggleSound = () => {
    const updated = soundManager.toggleMute();
    setIsMuted(updated);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070b16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('game')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-rose-500 p-[1px] shadow-sm shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400 rotate-[-45deg]" />
              </div>
            </div>
            <span className="text-xl font-black tracking-tight text-white font-display uppercase">
              Sky<span className="text-rose-500">Rush</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4–5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('game')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
              activeTab === 'game'
                ? 'text-cyan-400 border-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Flight Arena
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
              activeTab === 'leaderboard'
                ? 'text-cyan-400 border-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Leaderboard
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="whitespace-nowrap text-slate-400 hover:text-white transition-colors pb-0.5 border-b-2 border-transparent"
          >
            Fairness & Rules
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
              activeTab === 'tests'
                ? 'text-cyan-400 border-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Automated Tests
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap flex items-center gap-1.5 transition-colors pb-0.5 border-b-2 ${
              activeTab === 'admin'
                ? 'text-cyan-400 border-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Admin Console</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Area (Balance, Sound, Account) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Audio toggle button */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title={isMuted ? 'Unmute game audio' : 'Mute game audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Virtual Wallet Balance button */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all text-xs font-medium"
            title="Open virtual wallet and transaction history"
          >
            <span className="text-slate-400">Balance:</span>
            <span className="font-mono font-bold text-amber-400 text-sm tabular-nums">
              {user ? user.balance.toLocaleString() : '1,000'} V$
            </span>
            <div className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/30">
              <Plus className="w-3 h-3" />
            </div>
          </button>

          {/* Auth & Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenWallet}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user.displayName.slice(0, 2)}
                </div>
                <span className="hidden sm:inline font-medium text-slate-200 max-w-[90px] truncate">
                  {user.displayName}
                </span>
                {user.role === 'admin' && (
                  <span className="text-[10px] font-mono px-1 py-0.2 text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded">
                    ADMIN
                  </span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Log out of demo session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition-colors shadow-sm shadow-cyan-500/20"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
