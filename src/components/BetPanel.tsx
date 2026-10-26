import React, { useState } from 'react';
import { GameRound, Bet, User } from '../types/index.ts';
import { Minus, Plus, Zap, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../services/audio.ts';

interface BetPanelProps {
  panelIndex: 0 | 1;
  round: GameRound | null;
  user: User | null;
  userBet: Bet | undefined;
  minBet: number;
  maxBet: number;
  onPlaceBet: (amount: number, autoCashout?: number, panelIndex?: 0 | 1) => Promise<void>;
  onCashOut: (betId: string) => Promise<void>;
  onOpenAuth: () => void;
  isLoading: boolean;
}

export const BetPanel: React.FC<BetPanelProps> = ({
  panelIndex,
  round,
  user,
  userBet,
  minBet,
  maxBet,
  onPlaceBet,
  onCashOut,
  onOpenAuth,
  isLoading,
}) => {
  const [amount, setAmount] = useState<number>(panelIndex === 0 ? 50 : 100);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(false);
  const [autoCashoutMult, setAutoCashoutMult] = useState<string>('2.00');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCountdown = round?.status === 'COUNTDOWN';
  const isInFlight = round?.status === 'IN_FLIGHT';
  const isCrashed = round?.status === 'CRASHED';

  const hasBet = !!userBet;
  const isBetActive = userBet?.status === 'ACTIVE';
  const isCashedOut = userBet?.status === 'CASHED_OUT';
  const isBetCrashed = userBet?.status === 'CRASHED';

  // Live estimated payout during flight
  const currentMultiplier = round?.currentMultiplier || 1.0;
  const livePayout = userBet ? Math.floor(userBet.amount * currentMultiplier) : 0;

  const handleAmountChange = (newAmount: number) => {
    setErrorMsg(null);
    const clamped = Math.max(minBet, Math.min(maxBet, Math.floor(newAmount)));
    setAmount(clamped);
  };

  const handleAction = async () => {
    setErrorMsg(null);
    if (!user) {
      onOpenAuth();
      return;
    }

    // 1. In Flight: CASH OUT action
    if (isInFlight && isBetActive && userBet) {
      try {
        await onCashOut(userBet.id);
        soundManager.playCashoutChime();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Cashout failed');
      }
      return;
    }

    // 2. Countdown: PLACE BET action
    if (isCountdown && !hasBet) {
      if (amount > user.balance) {
        setErrorMsg(`Insufficient coins. Balance is ${user.balance.toLocaleString()} V$`);
        return;
      }
      let autoVal: number | undefined = undefined;
      if (autoCashoutEnabled) {
        const parsed = parseFloat(autoCashoutMult);
        if (!isNaN(parsed) && parsed >= 1.05) {
          autoVal = parsed;
        } else {
          setErrorMsg('Auto cashout must be >= 1.05x');
          return;
        }
      }

      try {
        await onPlaceBet(amount, autoVal, panelIndex);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to place bet');
      }
    }
  };

  return (
    <div className="bg-[#0b1021] border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
      {/* Panel Tag & Auto Cashout Toggle */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wide">
          Bet Deck {panelIndex + 1}
        </span>

        {/* Auto Cashout switch */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300 select-none">
            <input
              type="checkbox"
              checked={autoCashoutEnabled}
              onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
              disabled={hasBet}
              className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-slate-400">Auto Cash Out</span>
          </label>

          {autoCashoutEnabled && (
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs">
              <input
                type="number"
                step="0.1"
                min="1.05"
                max="100"
                value={autoCashoutMult}
                onChange={(e) => setAutoCashoutMult(e.target.value)}
                disabled={hasBet}
                className="w-12 bg-transparent text-cyan-400 font-mono font-bold focus:outline-none text-right"
              />
              <span className="text-slate-500 ml-0.5">x</span>
            </div>
          )}
        </div>
      </div>

      {/* Amount Controls */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Numeric input with dec/inc */}
          <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
            <button
              type="button"
              onClick={() => handleAmountChange(amount - 10)}
              disabled={hasBet || amount <= minBet}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              min={minBet}
              max={maxBet}
              value={amount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              disabled={hasBet}
              className="w-full text-center font-mono font-bold text-white bg-transparent focus:outline-none text-sm tabular-nums"
            />
            <button
              type="button"
              onClick={() => handleAmountChange(amount + 10)}
              disabled={hasBet || amount >= maxBet}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-amber-400 font-bold ml-1">V$</span>
          </div>
        </div>

        {/* Quick Amount Pill Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 text-[11px] font-mono font-semibold">
          {[10, 50, 100, 250].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleAmountChange(val)}
              disabled={hasBet}
              className="py-1 px-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors disabled:opacity-40"
            >
              {val}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleAmountChange(amount * 2)}
            disabled={hasBet || amount * 2 > maxBet}
            className="py-1 px-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded border border-slate-800 transition-colors disabled:opacity-40"
          >
            2X
          </button>
          <button
            type="button"
            onClick={() => handleAmountChange(user ? user.balance : 1000)}
            disabled={hasBet || !user || user.balance <= 0}
            className="py-1 px-1 bg-slate-900 hover:bg-slate-800 text-rose-400 rounded border border-slate-800 transition-colors disabled:opacity-40"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Main Action Button */}
      <div className="mt-1">
        {!user ? (
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full py-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-sm transition-all shadow-md shadow-cyan-500/20 uppercase tracking-wider"
          >
            Login To Place Bet
          </button>
        ) : isCountdown ? (
          hasBet ? (
            <div className="w-full py-3.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-display font-bold text-center text-sm flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>WAITING FOR TAKEOFF ({userBet.amount} V$)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              disabled={isLoading || amount > user.balance}
              className="w-full py-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-display font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] uppercase"
            >
              PLACE BET ({amount} V$)
            </button>
          )
        ) : isInFlight ? (
          isBetActive ? (
            <button
              type="button"
              onClick={handleAction}
              disabled={isLoading}
              className="w-full py-3.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-display font-black text-base tracking-wider transition-all shadow-lg shadow-amber-500/30 active:scale-[0.99] animate-pulse"
            >
              CASH OUT {livePayout} V$ ({currentMultiplier.toFixed(2)}x)
            </button>
          ) : isCashedOut ? (
            <div className="w-full py-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-display font-bold text-center text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>CASHED OUT: +{userBet.payout} V$ ({userBet.cashoutMultiplier?.toFixed(2)}x)</span>
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-display font-bold text-center text-sm uppercase"
            >
              IN FLIGHT · WAIT FOR NEXT ROUND
            </button>
          )
        ) : isCrashed ? (
          isCashedOut ? (
            <div className="w-full py-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-display font-bold text-center text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>WON +{userBet.payout} V$ ({userBet.cashoutMultiplier?.toFixed(2)}x)</span>
            </div>
          ) : isBetCrashed ? (
            <div className="w-full py-3.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-400 font-display font-bold text-center text-sm uppercase">
              FLEW AWAY (-{userBet?.amount} V$)
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-display font-bold text-center text-sm uppercase"
            >
              ROUND ENDED · NEXT SOON
            </button>
          )
        ) : null}
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="mt-2 text-center text-[11px] text-rose-400 font-medium">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
