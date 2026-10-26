import React, { useState } from 'react';
import { Bet } from '../types/index.ts';
import { Users, User as UserIcon, Trophy } from 'lucide-react';

interface LiveBetsTableProps {
  activeBets: Bet[];
  currentUserId?: string;
  totalBetsCount: number;
  totalCoinsBet: number;
}

export const LiveBetsTable: React.FC<LiveBetsTableProps> = ({
  activeBets,
  currentUserId,
  totalBetsCount,
  totalCoinsBet,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  const displayedBets =
    activeTab === 'my'
      ? activeBets.filter((b) => b.userId === currentUserId)
      : activeBets;

  const totalCashedOut = activeBets.filter((b) => b.status === 'CASHED_OUT').length;

  return (
    <div className="bg-[#0b1021] border border-slate-800 rounded-xl flex flex-col h-[400px] lg:h-full overflow-hidden shadow-lg">
      {/* Table Header Controls */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Bets ({activeBets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'my'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>My Bets</span>
          </button>
        </div>

        {/* Aggregate Stats */}
        <div className="text-[11px] font-mono text-slate-400 text-right">
          <div>
            Pool: <span className="text-amber-400 font-bold">{totalCoinsBet.toLocaleString()} V$</span>
          </div>
          <div className="text-slate-500">
            Cashed: {totalCashedOut}/{totalBetsCount}
          </div>
        </div>
      </div>

      {/* Bets List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 text-xs">
        {displayedBets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <Trophy className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-sm font-medium">No bets placed yet</p>
            <p className="text-xs text-slate-600 mt-1">
              {activeTab === 'my'
                ? 'Place a bet in the deck below to participate'
                : 'Waiting for pilots to check in'}
            </p>
          </div>
        ) : (
          displayedBets.map((bet) => {
            const isMe = bet.userId === currentUserId;
            const isCashed = bet.status === 'CASHED_OUT';
            const isCrashed = bet.status === 'CRASHED';

            return (
              <div
                key={bet.id}
                className={`px-3 py-2 flex items-center justify-between gap-3 transition-colors ${
                  isCashed
                    ? 'bg-emerald-950/20'
                    : isCrashed
                    ? 'bg-rose-950/10'
                    : isMe
                    ? 'bg-cyan-950/20'
                    : 'hover:bg-slate-900/40'
                }`}
              >
                {/* User Info */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0 ${
                      isMe
                        ? 'bg-cyan-500 text-slate-950'
                        : isCashed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {bet.userName.slice(0, 2)}
                  </div>
                  <div className="truncate">
                    <span
                      className={`font-medium truncate ${
                        isMe ? 'text-cyan-300 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {bet.userName} {isMe && '(You)'}
                    </span>
                    {bet.isBot && (
                      <span className="ml-1 text-[9px] font-mono text-slate-400">
                        BOT
                      </span>
                    )}
                  </div>
                </div>

                {/* Bet & Cashout Outcome */}
                <div className="flex items-center gap-3 shrink-0 text-right font-mono">
                  <span className="text-slate-400">{bet.amount} V$</span>

                  {isCashed ? (
                    <div className="w-24 text-right">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30">
                        {bet.cashoutMultiplier?.toFixed(2)}x
                      </span>
                      <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                        +{bet.payout} V$
                      </div>
                    </div>
                  ) : isCrashed ? (
                    <div className="w-24 text-right text-rose-500/70 text-[11px] font-bold">
                      CRASHED
                    </div>
                  ) : (
                    <div className="w-24 text-right text-slate-500 text-[11px]">
                      FLYING...
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
