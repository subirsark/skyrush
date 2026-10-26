import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export const DemoDisclaimerBanner: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="w-full bg-slate-900/90 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-400 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-semibold tracking-wide">DEMO SIMULATION ONLY</span>
        <span className="text-slate-400">· Virtual coins have zero real-world monetary value</span>
        <span className="underline ml-1">Expand notice</span>
      </button>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-amber-950/40 border-b border-amber-500/25 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-amber-400 mr-2">DEMO ONLY — ZERO REAL MONEY:</span>
            <span className="text-slate-300">
              SkyRush is strictly an educational aviation crash game simulator. All bets, winnings, and balances use simulated virtual coins (V$) with <strong>NO real-world cash value</strong>. No real deposits, withdrawals, cryptocurrency, or payouts exist.
            </span>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(true)}
          className="text-slate-400 hover:text-slate-200 transition-colors shrink-0 p-1 rounded hover:bg-slate-800"
          title="Minimize banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
