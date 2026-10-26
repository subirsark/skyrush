import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { DemoDisclaimerBanner } from './components/DemoDisclaimerBanner.tsx';
import { FlightCanvas } from './components/FlightCanvas.tsx';
import { BetPanel } from './components/BetPanel.tsx';
import { LiveBetsTable } from './components/LiveBetsTable.tsx';
import { RecentMultipliers } from './components/RecentMultipliers.tsx';
import { WalletModal } from './components/WalletModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HowToPlayModal } from './components/HowToPlayModal.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { TestSuiteModal } from './components/TestSuiteModal.tsx';
import { User, GameRound, Bet } from './types/index.ts';
import { api } from './services/api.ts';
import { soundManager } from './services/audio.ts';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard' | 'admin' | 'tests'>('game');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  // Game Engine State
  const [round, setRound] = useState<GameRound | null>(null);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  const [gameConfig, setGameConfig] = useState({ minBet: 10, maxBet: 5000, countdownDurationSec: 5 });
  const [isBetLoading, setIsBetLoading] = useState(false);

  // Poll server state every 200ms
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    checkAuth();

    const fetchState = async () => {
      try {
        const state = await api.getGameState();
        if (!isMountedRef.current) return;

        setRound(state.round);
        setActiveBets(state.activeBets);
        setUserBets(state.userBets);
        setHistory(state.history);
        setGameConfig(state.config);
        setServerTimeOffset(state.serverTime - Date.now());
      } catch (err) {
        // Fallback silently during brief dev server reloads
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 220);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  const checkAuth = async () => {
    try {
      if (api.getToken()) {
        const data = await api.getMe();
        setCurrentUser(data.user);
      }
    } catch {
      api.clearToken();
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const handlePlaceBet = async (amount: number, autoCashout?: number, panelIndex: 0 | 1 = 0) => {
    setIsBetLoading(true);
    try {
      const data = await api.placeBet(amount, autoCashout, panelIndex);
      if (currentUser) {
        setCurrentUser({ ...currentUser, balance: data.balance });
      }
      setUserBets((prev) => [...prev, data.bet]);
    } finally {
      setIsBetLoading(false);
    }
  };

  const handleCashOut = async (betId: string) => {
    setIsBetLoading(true);
    try {
      const data = await api.cashOut(betId);
      if (currentUser) {
        setCurrentUser({ ...currentUser, balance: data.balance });
      }
      setUserBets((prev) =>
        prev.map((b) => (b.id === betId ? data.bet : b))
      );
    } finally {
      setIsBetLoading(false);
    }
  };

  // Find active bets for Panel 0 and Panel 1
  const panel0Bet = userBets.find((b) => b.panelIndex === 0 && b.roundId === round?.id);
  const panel1Bet = userBets.find((b) => b.panelIndex === 1 && b.roundId === round?.id);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* 1. Universal Disclaimer Banner */}
      <DemoDisclaimerBanner />

      {/* 2. Standard Top Bar Navigation */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onLogout={handleLogout}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* 3. Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4">
        {activeTab === 'game' && (
          <div className="flex flex-col gap-3">
            {/* Recent Multipliers Strip */}
            <div className="bg-[#090e1f] border border-slate-800/80 rounded-xl px-3 py-1.5 shadow-sm">
              <RecentMultipliers history={history} />
            </div>

            {/* Split Arena Grid: Left Flight Area (2 cols) & Right Squad Feed (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left Column: Canvas + Dual Bet Decks */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-3">
                {/* 60fps Flight Canvas */}
                <FlightCanvas round={round} serverTimeOffset={serverTimeOffset} />

                {/* Dual Bet Decks (Bottom Controls) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <BetPanel
                    panelIndex={0}
                    round={round}
                    user={currentUser}
                    userBet={panel0Bet}
                    minBet={gameConfig.minBet}
                    maxBet={gameConfig.maxBet}
                    onPlaceBet={handlePlaceBet}
                    onCashOut={handleCashOut}
                    onOpenAuth={() => setIsAuthOpen(true)}
                    isLoading={isBetLoading}
                  />

                  <BetPanel
                    panelIndex={1}
                    round={round}
                    user={currentUser}
                    userBet={panel1Bet}
                    minBet={gameConfig.minBet}
                    maxBet={gameConfig.maxBet}
                    onPlaceBet={handlePlaceBet}
                    onCashOut={handleCashOut}
                    onOpenAuth={() => setIsAuthOpen(true)}
                    isLoading={isBetLoading}
                  />
                </div>
              </div>

              {/* Right Column: Live Squad Bets Feed */}
              <div className="lg:col-span-4 xl:col-span-3">
                <LiveBetsTable
                  activeBets={activeBets}
                  currentUserId={currentUser?.id}
                  totalBetsCount={round?.totalBetsCount || 0}
                  totalCoinsBet={round?.totalCoinsBet || 0}
                />
              </div>
            </div>

            {/* Quick Informational Cards Below Arena */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 mb-0.5">Dual-Deck Strategy</div>
                  <div className="text-slate-400 leading-relaxed">
                    Place two concurrent bets in Deck 1 and Deck 2 with custom auto cashouts to lock in early wins while letting high multipliers fly.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 mb-0.5">Server-Authoritative State</div>
                  <div className="text-slate-400 leading-relaxed">
                    All multipliers and crash points are verified on the server tick loop to guarantee zero client-side tampering or invalid payouts.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 mb-0.5">Zero Real-Money Risk</div>
                  <div className="text-slate-400 leading-relaxed">
                    SkyCoins (V$) are purely simulated demo currency. Refill at any time with the Faucet button without credit cards or real cash.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard View */}
        {activeTab === 'leaderboard' && <div className="w-full"><LeaderboardView /></div>}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && (
          <div className="w-full">
            <AdminDashboard currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />
          </div>
        )}

        {/* Automated QA Test Suite View */}
        {activeTab === 'tests' && <div className="w-full"><TestSuiteModal /></div>}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b16] py-5 px-4 text-xs text-slate-400 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-white uppercase tracking-tight">
              Sky<span className="text-rose-500">Rush</span>
            </span>
            <span>·</span>
            <span>Educational Aviation Crash Game Simulator</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              RNG Mathematics
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className="hover:text-slate-200 transition-colors"
            >
              Automated Tests
            </button>
            <button
              onClick={() => setIsWalletOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Demo Faucet
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setCurrentUser(u);
          setIsAuthOpen(false);
        }}
      />

      <WalletModal
        user={currentUser}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onBalanceUpdated={(newBal) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, balance: newBal });
          }
        }}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
    </div>
  );
}
