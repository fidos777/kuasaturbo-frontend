'use client';

import { useState } from 'react';
import {
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Gift,
  Play,
  RotateCcw,
  Lock,
  Unlock,
  Settings,
  Clock,
  Filter,
  Hash,
} from 'lucide-react';
import { useCreditStore } from '@/store/creditStore';
import { CreditTransaction, CreditTransactionType } from '@/types/orchestrator';

// ============================================================================
// CREDIT LEDGER (Phase 8.1)
// ============================================================================
// Invariant I5: "No Chaos Without Consequence" - Which ledger drives the money?
// Shows complete transaction history with proof hashes
// ============================================================================

const TRANSACTION_ICONS: Record<CreditTransactionType, typeof ArrowUpCircle> = {
  purchase: ArrowUpCircle,
  bonus: Gift,
  execution: Play,
  refund: RotateCcw,
  reservation: Lock,
  release: Unlock,
  adjustment: Settings,
  expiry: Clock,
};

const TRANSACTION_COLORS: Record<CreditTransactionType, string> = {
  purchase: 'text-success',
  bonus: 'text-purple-400',
  execution: 'text-error',
  refund: 'text-success',
  reservation: 'text-amber-400',
  release: 'text-blue-400',
  adjustment: 'text-gray-400',
  expiry: 'text-gray-500',
};

const TRANSACTION_LABELS: Record<CreditTransactionType, string> = {
  purchase: 'Purchase',
  bonus: 'Bonus',
  execution: 'Execution',
  refund: 'Refund',
  reservation: 'Reserved',
  release: 'Released',
  adjustment: 'Adjustment',
  expiry: 'Expired',
};

interface CreditLedgerProps {
  variant?: 'full' | 'compact';
  limit?: number;
  showFilters?: boolean;
}

export default function CreditLedger({
  variant = 'full',
  limit,
  showFilters = true,
}: CreditLedgerProps) {
  const { transactions, balance } = useCreditStore();
  const [filterType, setFilterType] = useState<CreditTransactionType | 'all'>('all');

  const filteredTransactions = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .slice(0, limit);

  if (variant === 'compact') {
    return (
      <div className="bg-card border border-gray-700 rounded-card">
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <History size={14} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-300">Recent Activity</span>
          </div>
        </div>
        <div className="divide-y divide-gray-700/50">
          {filteredTransactions.slice(0, 5).map((tx) => (
            <TransactionRowCompact key={tx.id} transaction={tx} />
          ))}
          {filteredTransactions.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No transactions yet
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-gray-700 rounded-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-primary" />
            <h3 className="text-lg font-semibold text-white">Credit Ledger</h3>
            <span className="text-xs text-gray-500">
              Invariant I5: No Chaos Without Consequence
            </span>
          </div>
          {balance && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Current Balance</div>
              <div className="text-xl font-bold text-white">
                {balance.balance.toLocaleString()} credits
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <div className="flex gap-1 flex-wrap">
              <FilterButton
                active={filterType === 'all'}
                onClick={() => setFilterType('all')}
              >
                All
              </FilterButton>
              {(['purchase', 'execution', 'refund', 'bonus'] as CreditTransactionType[]).map(type => (
                <FilterButton
                  key={type}
                  active={filterType === type}
                  onClick={() => setFilterType(type)}
                >
                  {TRANSACTION_LABELS[type]}
                </FilterButton>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-gray-700/50 max-h-[400px] overflow-y-auto">
        {filteredTransactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}
        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center">
            <History size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {balance && (
        <div className="p-4 border-t border-gray-700 bg-gray-800/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400">Total Purchased</div>
              <div className="text-sm font-semibold text-success">
                +{balance.lifetime_purchased.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Total Used</div>
              <div className="text-sm font-semibold text-error">
                -{balance.lifetime_used.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Net Balance</div>
              <div className="text-sm font-semibold text-white">
                {balance.balance.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Button
function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded-button transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

// Full Transaction Row
function TransactionRow({ transaction }: { transaction: CreditTransaction }) {
  const [showProof, setShowProof] = useState(false);
  const Icon = TRANSACTION_ICONS[transaction.type];
  const color = TRANSACTION_COLORS[transaction.type];
  const isPositive = transaction.amount > 0;

  return (
    <div className="p-4 hover:bg-gray-800/30 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg bg-gray-700/50 ${color}`}>
          <Icon size={16} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {TRANSACTION_LABELS[transaction.type]}
              </span>
              {transaction.trust_multiplier && transaction.trust_multiplier !== 1 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  transaction.trust_multiplier < 1
                    ? 'bg-success/20 text-success'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {transaction.trust_multiplier}x
                </span>
              )}
            </div>
            <span className={`text-sm font-bold ${isPositive ? 'text-success' : 'text-error'}`}>
              {isPositive ? '+' : ''}{transaction.amount.toLocaleString()}
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-1">{transaction.description}</p>

          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <span>{new Date(transaction.created_at).toLocaleString()}</span>
            <span>Balance: {transaction.balance_after.toLocaleString()}</span>
            {transaction.workflow_name && (
              <span>Workflow: {transaction.workflow_name}</span>
            )}
          </div>

          {/* Proof Hash (Invariant I2) */}
          {transaction.proof_hash && (
            <button
              onClick={() => setShowProof(!showProof)}
              className="mt-2 flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300"
            >
              <Hash size={10} />
              {showProof ? 'Hide' : 'Show'} Proof Hash
            </button>
          )}
          {showProof && transaction.proof_hash && (
            <div className="mt-1 p-2 bg-gray-800/50 rounded text-[10px] font-mono text-gray-400 break-all">
              {transaction.proof_hash}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact Transaction Row
function TransactionRowCompact({ transaction }: { transaction: CreditTransaction }) {
  const Icon = TRANSACTION_ICONS[transaction.type];
  const color = TRANSACTION_COLORS[transaction.type];
  const isPositive = transaction.amount > 0;

  return (
    <div className="px-3 py-2 flex items-center gap-2">
      <Icon size={12} className={color} />
      <span className="flex-1 text-xs text-gray-400 truncate">
        {TRANSACTION_LABELS[transaction.type]}
      </span>
      <span className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
        {isPositive ? '+' : ''}{transaction.amount}
      </span>
    </div>
  );
}
