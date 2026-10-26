import React, { useState } from 'react';
import { History, ShieldCheck, X } from 'lucide-react';

interface RecentHistoryItem {
  id: string;
  roundNumber: number;
  crashMultiplier: number;
  crashedAtTime: number;
  totalBets: number;
  totalPayout: number;
}

interface RecentMultipliersProps {
  history: RecentHistoryItem[];
}

export const RecentMultipliers: React.FC<RecentMultipliersProps> = ({ history }) => {
  const [selectedRound, setSelectedRound] = useState<RecentHistoryItem | null>(null);

  const getBadgeStyle = (mult: number) => {
    if (mult >= 10.0) {
      return 'bg-amber-950/80 text-amber-300 border-amber-600/60 shadow-sm shadow-amber-500/20 hover:border-amber-400';
    }
    if (mult >= 2.0) {
      return 'bg-purple-950/70 text-purple-300 border-purple-700/50 hover:border-purple-400';
    }
    return 'bg-blue-950/60 text-cyan-400 border-cyan-800/40 hover:border-cyan-400';
  };

  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 mr-1">
        <History className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold uppercase text-[11px] tracking-wider hidden sm:inline">Recent</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {history.slice(0, 18).map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedRound(item)}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all cursor-pointer shrink-0 ${getBadgeStyle(
              item.crashMultiplier
            )}`}
            title={`Round #${item.roundNumber} - Click to verify seed & telemetry`}
          >
            {item.crashMultiplier.toFixed(2)}x
          </button>
        ))}
      </div>

      {/* Round Details Modal */}
      {selectedRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Round #{selectedRound.roundNumber} Telemetry
                </h3>
              </div>
              <button
                onClick={() => setSelectedRound(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 px-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Crash Multiplier</span>
                <span
                  className={`font-mono text-base font-bold ${
                    selectedRound.crashMultiplier >= 2 ? 'text-purple-400' : 'text-cyan-400'
                  }`}
                >
                  {selectedRound.crashMultiplier.toFixed(2)}x
                </span>
              </div>

              <div className="flex justify-between items-center py-2 px-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Round ID</span>
                <span className="font-mono text-slate-300">{selectedRound.id}</span>
              </div>

              <div className="flex justify-between items-center py-2 px-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Total Virtual Bets Placed</span>
                <span className="font-mono text-slate-200">{selectedRound.totalBets}</span>
              </div>

              <div className="flex justify-between items-center py-2 px-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Total Virtual Payout</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {selectedRound.totalPayout.toLocaleString()} V$
                </span>
              </div>

              <div className="flex justify-between items-center py-2 px-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Timestamp</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedRound.crashedAtTime).toLocaleTimeString()}
                </span>
              </div>

              <div className="p-3 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                <div className="font-semibold text-slate-300 mb-1">Crash Generation Logic:</div>
                Each round multiplier is determined by an unbiased RNG formula with a 4.0% simulated house edge. Instant crashes (1.00x) occur on ~3.5% of rounds.
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setSelectedRound(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors text-xs"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
