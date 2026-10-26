import React, { useState, useEffect } from 'react';
import { Wallet, Coins, RefreshCw, X, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { User, WalletTransaction } from '../types/index.ts';
import { api } from '../services/api.ts';

interface WalletModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onBalanceUpdated: (newBalance: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  user,
  isOpen,
  onClose,
  onBalanceUpdated,
}) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [faucetLoading, setFaucetLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadTransactions();
    }
  }, [isOpen, user]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTransactions();
      setTransactions(data.transactions);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestFaucet = async () => {
    setFaucetLoading(true);
    setFeedbackMsg(null);
    try {
      const data = await api.requestFaucet();
      onBalanceUpdated(data.balance);
      setFeedbackMsg(`+${data.added.toLocaleString()} virtual coins credited to your demo balance!`);
      loadTransactions();
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'Failed to claim coins');
    } finally {
      setFaucetLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Virtual Wallet & Ledger</h2>
              <div className="text-xs text-slate-400">
                Demo simulation account · No real world value
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card & Faucet Action */}
        <div className="my-5 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-950 via-[#0b1021] to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Simulated Virtual Balance
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tabular-nums">
                {user ? user.balance.toLocaleString() : '1,000'}
              </span>
              <span className="text-sm font-mono font-bold text-slate-400">V$ (SkyCoins)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Coins cannot be cashed out, deposited, or traded for real currency.</span>
            </div>
          </div>

          <button
            onClick={handleRequestFaucet}
            disabled={faucetLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Coins className="w-4 h-4" />
            <span>{faucetLoading ? 'Crediting...' : 'Refill +1,000 Demo Coins'}</span>
          </button>
        </div>

        {feedbackMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 font-medium text-center">
            {feedbackMsg}
          </div>
        )}

        {/* Transactions Table */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Transaction Audit Trail
          </span>
          <button
            onClick={loadTransactions}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60 divide-y divide-slate-800/40 text-xs">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No transactions recorded yet. Place bets or claim faucet coins.
            </div>
          ) : (
            transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 truncate">{tx.note}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.timestamp).toLocaleString()} · ID: {tx.id.slice(0, 14)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div
                      className={`font-bold text-xs ${
                        isPositive ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} V$
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Bal: {tx.balanceAfter.toLocaleString()} V$
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition-colors"
          >
            Close Wallet
          </button>
        </div>
      </div>
    </div>
  );
};
