import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api.ts';
import { TestSuiteResult } from '../types/index.ts';

export const TestSuiteModal: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestSuiteResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const data = await api.runTestSuite();
      setResults(data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to execute automated test suite');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 animate-in fade-in duration-200 space-y-6">
      {/* Top Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-display font-black text-white">Automated QA Test Suite</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Verifies server-authoritative flight states, mathematical multiplier curves, pre-crash payouts, post-crash loss settlements, double-spend prevention, and role isolation.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 shrink-0"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Asserts...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Execute 10-Point Suite</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Summary Scorecard */}
      {results && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Scenarios</div>
            <div className="text-3xl font-mono font-bold text-white mt-1">{results.total}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Passed</div>
            <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">{results.passed}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Failed</div>
            <div className={`text-3xl font-mono font-bold mt-1 ${results.failed > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
              {results.failed}
            </div>
          </div>
        </div>
      )}

      {/* Test Scenarios List */}
      <div className="bg-[#0b1021] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Test Scenario Assertions</span>
          <span>Result</span>
        </div>

        <div className="divide-y divide-slate-800/40 text-xs">
          {results ? (
            results.results.map((item, idx) => (
              <div
                key={idx}
                className="p-4 flex items-start justify-between gap-4 hover:bg-slate-900/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 font-bold">#{idx + 1}</span>
                    <span className="font-bold text-white">{item.name}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{item.description}</p>
                  <p className="text-[10px] font-mono text-slate-500">{item.details}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.durationMs}ms</span>
                  </div>
                  {item.passed ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PASSED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-[11px]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAILED</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-700 mx-auto" />
              <div className="text-sm font-medium text-slate-400">Automated QA Suite Ready</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click <strong>"Execute 10-Point Suite"</strong> above to run end-to-end unit and integration verification against server state machines.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
