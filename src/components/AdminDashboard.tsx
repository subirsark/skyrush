import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sliders,
  Users,
  Coins,
  History,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { User, GameConfig, AdminAuditLog } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AdminDashboardProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onOpenAuth }) => {
  const [data, setData] = useState<{
    metrics: any;
    users: User[];
    auditLogs: AdminAuditLog[];
    config: GameConfig;
    recentHistory: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Grant / Reset form state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [grantAmount, setGrantAmount] = useState<number>(500);
  const [grantReason, setGrantReason] = useState<string>('');

  // Config edit state
  const [configForm, setConfigForm] = useState<GameConfig | null>(null);
  const [forcedCrashInput, setForcedCrashInput] = useState<string>('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadOverview();
    }
  }, [currentUser]);

  const loadOverview = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const overview = await api.getAdminOverview();
      setData(overview);
      setConfigForm(overview.config);
      if (overview.users.length > 0 && !selectedUser) {
        setSelectedUser(overview.users[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load administrative overview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedUser || !grantReason.trim()) {
      setErrorMsg('Target user and required audit reason must be provided.');
      return;
    }

    try {
      const res = await api.adminGrantCoins(selectedUser, grantAmount, grantReason.trim());
      setSuccessMsg(`Coins adjusted successfully. Target user new balance: ${res.newBalance.toLocaleString()} V$`);
      setGrantReason('');
      loadOverview();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Coin adjustment failed');
    }
  };

  const handleResetBalance = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedUser) {
      setErrorMsg('Please select a target user.');
      return;
    }

    const reason = prompt('Please enter a required reason for resetting this user balance to default:');
    if (!reason || !reason.trim()) {
      setErrorMsg('Reset cancelled: Audit reason is mandatory.');
      return;
    }

    try {
      const res = await api.adminResetBalance(selectedUser, reason.trim());
      setSuccessMsg(`User balance reset to default ${res.newBalance.toLocaleString()} V$. Audit logged.`);
      loadOverview();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Reset failed');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const forced = forcedCrashInput ? parseFloat(forcedCrashInput) : null;
      await api.adminUpdateConfig({
        ...configForm,
        forcedNextCrash: forced,
      });
      setSuccessMsg('Game configuration and QA crash overrides updated successfully.');
      loadOverview();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update configuration');
    }
  };

  // If not admin, show protection screen
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-display font-bold text-white">Administrator Portal Protected</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          Access to this area requires an authenticated administrator session enforced by server-side role validation.
        </p>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 max-w-md mx-auto space-y-1.5">
          <div className="font-semibold text-cyan-400">Default Demo Admin Credentials:</div>
          <div className="font-mono text-slate-400">Email: <span className="text-white">admin@skyrush.demo</span></div>
          <div className="font-mono text-slate-400">Password: <span className="text-white">DemoAdmin2026!</span></div>
        </div>

        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
        >
          Sign In As Administrator
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-display font-black text-white">
              Flight Control Administration
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Authoritative simulation parameters, user balance management, and compliance audit trail
          </p>
        </div>

        <button
          onClick={loadOverview}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
        >
          Refresh Telemetry
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Stats Strip */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Registered Pilots</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {data.metrics.registeredUsersCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Isolated demo accounts</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Total Virtual Bets</div>
            <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
              {data.metrics.totalVirtualBets}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {data.metrics.totalCoinsBet.toLocaleString()} V$ placed
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Virtual Payouts</div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {data.metrics.totalCoinsPaid.toLocaleString()} V$
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Cashed out by pilots</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">House Margin</div>
            <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
              {data.metrics.netHouseMargin.toLocaleString()} V$
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Simulated demo delta</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Balance Management Panel */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Virtual Coin Allotment & Balance Reset
            </h2>
          </div>

          <form onSubmit={handleGrantCoins} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Select Target Pilot</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              >
                {data?.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.username}) — Balance: {u.balance.toLocaleString()} V$ [{u.role.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Coin Adjustment Amount</label>
                <input
                  type="number"
                  step="50"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(Number(e.target.value))}
                  placeholder="e.g. 500 or -200"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Preset Adjustments</label>
                <div className="flex gap-1.5">
                  {[250, 500, 1000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setGrantAmount(val)}
                      className="flex-1 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 font-mono text-[11px]"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Mandatory Audit Justification / Reason <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={grantReason}
                onChange={(e) => setGrantReason(e.target.value)}
                placeholder="e.g. Promotional VIP reward or QA testing grant"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                Apply Virtual Coin Adjustment
              </button>
              <button
                type="button"
                onClick={handleResetBalance}
                className="px-4 py-2.5 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-rose-300 font-medium transition-colors flex items-center gap-1.5"
                title="Reset this user's balance to 1,000 V$"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Balance</span>
              </button>
            </div>
          </form>
        </div>

        {/* Game Engine Configuration Panel */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Flight Engine Parameters & Test Overrides
            </h2>
          </div>

          {configForm && (
            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Countdown Duration (sec)</label>
                  <input
                    type="number"
                    min="2"
                    max="15"
                    value={configForm.countdownDurationSec}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, countdownDurationSec: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Simulated House Margin (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={configForm.houseEdgePercent}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, houseEdgePercent: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Min Bet (V$)</label>
                  <input
                    type="number"
                    min="1"
                    value={configForm.minBet}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, minBet: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Max Bet (V$)</label>
                  <input
                    type="number"
                    min="100"
                    value={configForm.maxBet}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, maxBet: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              {/* Deterministic Forced Crash Target */}
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/30">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>QA Deterministic Crash Multiplier Override</span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">
                  Force the NEXT round to crash at this exact multiplier (e.g. 5.00x, 2.00x, or 1.10x) for testing.
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="1.00"
                    max="100"
                    value={forcedCrashInput}
                    onChange={(e) => setForcedCrashInput(e.target.value)}
                    placeholder="Leave blank for RNG distribution"
                    className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setForcedCrashInput('3.50')}
                    className="px-2 py-1.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]"
                  >
                    3.50x
                  </button>
                  <button
                    type="button"
                    onClick={() => setForcedCrashInput('1.25')}
                    className="px-2 py-1.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]"
                  >
                    1.25x
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
              >
                Save Engine Parameters
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Admin Audit Trail Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">
            Administrative Action Audit Trail
          </h2>
        </div>

        <div className="border border-slate-800 rounded-xl bg-slate-950 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Administrator</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target User</th>
                  <th className="py-2.5 px-3">Audit Details & Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {data?.auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold whitespace-nowrap">
                      {log.adminName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {log.targetUserName || log.targetUserId || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
