'use client';

import { useState, useEffect } from 'react';
import { UsageStats } from '@/types';
import { getUsageStats, resetUsageStats } from '@/lib/storage';
import { Activity, Coins, ArrowUpRight, ArrowDownLeft, RotateCcw, Hash } from 'lucide-react';

// Prezzi per milione di token (USD) - Claude Sonnet 4
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4 },
  'claude-opus-4-6': { input: 15, output: 75 },
};
const DEFAULT_PRICING = { input: 3, output: 15 };

function calculateCost(inputTokens: number, outputTokens: number, model?: string): number {
  const pricing = (model && PRICING[model]) || DEFAULT_PRICING;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export default function UsageDashboard() {
  const [stats, setStats] = useState<UsageStats>({
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalRequests: 0,
    history: [],
  });

  useEffect(() => {
    setStats(getUsageStats());
  }, []);

  const handleReset = () => {
    if (confirm('Azzerare tutte le statistiche di utilizzo?')) {
      resetUsageStats();
      setStats(getUsageStats());
    }
  };

  const totalTokens = stats.totalInputTokens + stats.totalOutputTokens;
  const totalCost = stats.history.reduce(
    (sum, entry) => sum + calculateCost(entry.inputTokens, entry.outputTokens, entry.model),
    0
  );

  const formatNumber = (n: number) => new Intl.NumberFormat('it-IT').format(n);
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(n);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Utilizzo &amp; Costi API</h2>
            <p className="text-sm text-gray-500">Monitoraggio token e spesa Claude AI</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Azzera
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Richieste"
          value={formatNumber(stats.totalRequests)}
          icon={<Hash className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          label="Token Input"
          value={formatNumber(stats.totalInputTokens)}
          icon={<ArrowUpRight className="w-4 h-4" />}
          color="purple"
        />
        <StatCard
          label="Token Output"
          value={formatNumber(stats.totalOutputTokens)}
          icon={<ArrowDownLeft className="w-4 h-4" />}
          color="amber"
        />
        <StatCard
          label="Spesa Totale"
          value={formatCurrency(totalCost)}
          icon={<Coins className="w-4 h-4" />}
          color="emerald"
          highlight
        />
      </div>

      {/* Summary bar */}
      {totalTokens > 0 && (
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Input: {((stats.totalInputTokens / totalTokens) * 100).toFixed(1)}%</span>
            <span>Output: {((stats.totalOutputTokens / totalTokens) * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="bg-purple-500 rounded-l-full"
              style={{ width: `${(stats.totalInputTokens / totalTokens) * 100}%` }}
            />
            <div
              className="bg-amber-400 rounded-r-full"
              style={{ width: `${(stats.totalOutputTokens / totalTokens) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* History table */}
      {stats.history.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Ultime richieste</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Data</th>
                  <th className="text-right py-2 px-4 font-medium text-gray-500">Input</th>
                  <th className="text-right py-2 px-4 font-medium text-gray-500">Output</th>
                  <th className="text-right py-2 px-4 font-medium text-gray-500">Totale</th>
                  <th className="text-right py-2 pl-4 font-medium text-gray-500">Costo</th>
                </tr>
              </thead>
              <tbody>
                {stats.history.slice(0, 20).map((entry, i) => {
                  const cost = calculateCost(entry.inputTokens, entry.outputTokens, entry.model);
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 pr-4 text-gray-600">
                        {new Date(entry.date).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-purple-600 font-mono text-xs">
                        {formatNumber(entry.inputTokens)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-amber-600 font-mono text-xs">
                        {formatNumber(entry.outputTokens)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-700 font-mono text-xs">
                        {formatNumber(entry.inputTokens + entry.outputTokens)}
                      </td>
                      <td className="py-2.5 pl-4 text-right text-emerald-600 font-semibold font-mono text-xs">
                        {formatCurrency(cost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 py-6">
          Nessuna richiesta ancora. Genera un preventivo per vedere le statistiche.
        </p>
      )}

      {/* Pricing reference */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Prezzi: Sonnet 4 — $3/M input, $15/M output | Haiku 4.5 — $0.80/M input, $4/M output | Opus 4.6 — $15/M input, $75/M output
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'amber' | 'emerald';
  highlight?: boolean;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
