import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Target, Shield, Clock } from 'lucide-react';
import { LeaderboardEntry } from '../types/index.ts';
import { api } from '../services/api.ts';

export const LeaderboardView: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'weekly' | 'daily'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data.leaderboard);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 animate-in fade-in duration-200">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-display font-black text-white">Pilot Hall of Fame</h1>
          </div>
          <p className="text-xs text-slate-400">
            Ranked strictly by cumulative net virtual profit (V$). Demo coins only.
          </p>
        </div>

        {/* Time filters (Interactive tab buttons allowed) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setFilter('daily')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'daily'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'weekly'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#0b1021] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5 sm:col-span-4">Pilot Callsign</div>
          <div className="col-span-3 text-right">Net Virtual Profit</div>
          <div className="hidden sm:block col-span-2 text-right">Top Multiplier</div>
          <div className="col-span-3 sm:col-span-2 text-right">Games / Win %</div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Loading flight telemetry...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No flight records available yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40 text-xs">
            {leaderboard.map((pilot, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={pilot.userId}
                  className={`grid grid-cols-12 px-4 py-3.5 items-center transition-colors hover:bg-slate-900/40 ${
                    rank === 1
                      ? 'bg-amber-500/5'
                      : rank === 2
                      ? 'bg-slate-400/5'
                      : rank === 3
                      ? 'bg-amber-700/5'
                      : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-center font-mono font-bold">
                    {rank === 1 ? (
                      <span className="text-amber-400 text-sm">🥇 1</span>
                    ) : rank === 2 ? (
                      <span className="text-slate-300 text-sm">🥈 2</span>
                    ) : rank === 3 ? (
                      <span className="text-amber-600 text-sm">🥉 3</span>
                    ) : (
                      <span className="text-slate-500">#{rank}</span>
                    )}
                  </div>

                  {/* Callsign & Badge */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                        isTop3
                          ? 'bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {pilot.displayName.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 truncate">
                        {pilot.displayName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        {pilot.isSimulated ? (
                          <span className="text-slate-400 font-mono">SIMULATED BOT ROSTER</span>
                        ) : (
                          <span className="text-emerald-400 font-mono">AUTHENTICATED PILOT</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="col-span-3 text-right font-mono font-bold">
                    <span
                      className={pilot.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                    >
                      {pilot.netProfit >= 0 ? '+' : ''}
                      {pilot.netProfit.toLocaleString()} V$
                    </span>
                  </div>

                  {/* Top Multiplier */}
                  <div className="hidden sm:block col-span-2 text-right font-mono text-purple-400 font-semibold">
                    {pilot.highestMultiplier.toFixed(2)}x
                  </div>

                  {/* Games Played / Win Rate */}
                  <div className="col-span-3 sm:col-span-2 text-right font-mono">
                    <div className="text-slate-300">{pilot.roundsPlayed} flights</div>
                    <div className="text-[10px] text-slate-500">{pilot.winRate}% cashout</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transparent Disclaimer */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-slate-300 mb-0.5">Performance Metric Governance:</div>
          Rankings are calculated solely using cumulative net virtual coin earnings from recorded demo game rounds. Simulated squad players are explicitly labeled to ensure full transparency and avoid representing simulated scores as authentic user accounts.
        </div>
      </div>
    </div>
  );
};
