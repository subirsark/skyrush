import React, { useState } from 'react';
import { BookOpen, Calculator, ShieldCheck, AlertTriangle, X, ArrowRight } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [calcBet, setCalcBet] = useState(100);
  const [calcMult, setCalcMult] = useState(2.5);

  if (!isOpen) return null;

  const estimatedPayout = Math.floor(calcBet * calcMult);
  const estimatedProfit = estimatedPayout - calcBet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">
                How To Play & Crash Generation Logic
              </h2>
              <div className="text-xs text-slate-400">Rules, mechanics, and transparent RNG documentation</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 my-4 pr-1 text-xs text-slate-300">
          {/* 1. Core Mechanics */}
          <div className="space-y-3">
            <h3 className="text-sm font-display font-bold text-cyan-400 uppercase tracking-wider">
              1. Round Flight Sequence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Countdown Phase</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Before each flight, a 5-second countdown begins. Enter your virtual bet amount and set an optional Auto Cash-Out multiplier.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>Supersonic Climb</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  The jet accelerates from 1.00x upward along an exponential trajectory. The higher the jet climbs, the bigger your potential demo payout.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>Cash Out or Crash</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Click <strong>Cash Out</strong> before the jet flies away! If you cash out in time, you win Bet × Multiplier. If the jet crashes first, the bet is lost.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Interactive Calculator */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Interactive Virtual Payout Calculator
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Virtual Bet Amount</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="10"
                  value={calcBet}
                  onChange={(e) => setCalcBet(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Target Multiplier</label>
                <input
                  type="number"
                  min="1.01"
                  max="100"
                  step="0.1"
                  value={calcMult}
                  onChange={(e) => setCalcMult(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-mono font-bold"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400">Estimated Payout</div>
                <div className="font-mono text-base font-bold text-emerald-400">
                  {estimatedPayout.toLocaleString()} V$
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Net: +{estimatedProfit.toLocaleString()} V$
                </div>
              </div>
            </div>
          </div>

          {/* 3. Crash RNG Documentation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Demo Crash Multiplier Generation Logic
              </h3>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              The crash multiplier in this demo is determined server-side before the start of each round using standard statistical crash game distribution:
            </p>

            <pre className="p-3 rounded bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto">
{`// Generate uniform random float r in [0, 1)
const r = cryptoRandom();
const houseEdge = 0.04; // 4.0% simulated house margin

if (r < 0.035) {
  crashMultiplier = 1.00; // ~3.5% instant crash rate
} else {
  // Standard inverse cumulative distribution
  crashMultiplier = Math.floor(((1 - houseEdge) / (1 - r)) * 100) / 100;
}`}
            </pre>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>Notice:</strong> This simulation uses server-authoritative state and SHA-256 seed hashing to demonstrate deterministic verification concepts. It is an educational simulation and not an independently certified third-party casino implementation.
            </p>
          </div>

          {/* 4. Compliance Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="text-[11px] leading-relaxed">
              <strong>Simulation Only:</strong> SkyRush uses virtual coins (V$) exclusively. There is no real-money gambling, deposits, withdrawals, or monetary value of any kind.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
          >
            Got It, Back to Cockpit
          </button>
        </div>
      </div>
    </div>
  );
};
