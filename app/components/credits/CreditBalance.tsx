'use client';

import { useEffect } from 'react';
import { Coins, AlertTriangle, Plus, TrendingDown, Zap } from 'lucide-react';
import { useCreditStore } from '@/store/creditStore';
import { CREDIT_COST_MULTIPLIERS, WorkflowStatus } from '@/types/orchestrator';

// ============================================================================
// CREDIT BALANCE DISPLAY COMPONENT (Phase 8.1)
// ============================================================================
// Invariant I4: "No Economy Without Credits"
// Shows user their credit balance and trust economics
// ============================================================================

interface CreditBalanceProps {
  variant?: 'full' | 'compact' | 'mini';
  showTopUp?: boolean;
  currentWorkflowStatus?: WorkflowStatus;
}

export default function CreditBalance({
  variant = 'compact',
  showTopUp = true,
  currentWorkflowStatus,
}: CreditBalanceProps) {
  const {
    balance,
    initializeBalance,
    openPurchaseModal,
    isLowBalance,
  } = useCreditStore();

  // Initialize with demo tenant on mount
  useEffect(() => {
    if (!balance) {
      initializeBalance('demo-tenant-001', 'Demo User');
    }
  }, [balance, initializeBalance]);

  if (!balance) {
    return (
      <div className="animate-pulse bg-gray-700/50 rounded-lg h-10 w-24" />
    );
  }

  const lowBalance = isLowBalance();
  const multiplier = currentWorkflowStatus ? CREDIT_COST_MULTIPLIERS[currentWorkflowStatus] : null;
  const discountPercent = multiplier !== null ? Math.round((1 - multiplier) * 100) : 0;

  // Mini variant - just the number
  if (variant === 'mini') {
    return (
      <button
        onClick={() => openPurchaseModal()}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
          lowBalance
            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
        }`}
      >
        <Coins size={14} className={lowBalance ? 'text-amber-400' : 'text-primary'} />
        <span className="text-sm font-medium">{balance.available.toLocaleString()}</span>
        {lowBalance && <AlertTriangle size={12} className="text-amber-400" />}
      </button>
    );
  }

  // Compact variant - balance with top-up button
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
        lowBalance
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-card border-gray-700'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${lowBalance ? 'bg-amber-500/20' : 'bg-primary/20'}`}>
            <Coins size={16} className={lowBalance ? 'text-amber-400' : 'text-primary'} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-white">
                {balance.available.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">credits</span>
            </div>
            {balance.reserved > 0 && (
              <span className="text-[10px] text-gray-500">
                ({balance.reserved} reserved)
              </span>
            )}
          </div>
        </div>

        {/* Trust Multiplier Badge */}
        {multiplier !== null && discountPercent > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-success/20 rounded-full">
            <TrendingDown size={12} className="text-success" />
            <span className="text-xs font-medium text-success">{discountPercent}% off</span>
          </div>
        )}

        {/* Low Balance Warning */}
        {lowBalance && (
          <div className="flex items-center gap-1 text-amber-400">
            <AlertTriangle size={14} />
            <span className="text-xs">Low</span>
          </div>
        )}

        {/* Top Up Button */}
        {showTopUp && (
          <button
            onClick={() => openPurchaseModal()}
            className="flex items-center gap-1 px-2 py-1 bg-primary hover:bg-primary-600
              text-white text-xs font-medium rounded-button transition-colors"
          >
            <Plus size={12} />
            Top Up
          </button>
        )}
      </div>
    );
  }

  // Full variant - detailed view with trust economics
  return (
    <div className={`bg-card border rounded-card p-4 ${
      lowBalance ? 'border-amber-500/30' : 'border-gray-700'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${lowBalance ? 'bg-amber-500/20' : 'bg-primary/20'}`}>
            <Coins size={20} className={lowBalance ? 'text-amber-400' : 'text-primary'} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Execution Credits</h3>
            <p className="text-xs text-gray-400">Invariant I4: No Economy Without Credits</p>
          </div>
        </div>
        {showTopUp && (
          <button
            onClick={() => openPurchaseModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-600
              text-white text-sm font-medium rounded-button transition-colors"
          >
            <Plus size={14} />
            Top Up
          </button>
        )}
      </div>

      {/* Balance Display */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {balance.available.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400">
            {balance.reserved.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Reserved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-500">
            {balance.balance.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
      </div>

      {/* Trust Economics */}
      {currentWorkflowStatus && multiplier !== null && (
        <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-semibold text-gray-300">Trust Economics</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">Current Status:</span>
              <span className="ml-2 text-xs font-medium text-white capitalize">
                {currentWorkflowStatus.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Multiplier:</span>
              <span className={`text-sm font-bold ${
                multiplier < 1 ? 'text-success' : multiplier > 1 ? 'text-amber-400' : 'text-white'
              }`}>
                {multiplier}x
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-success">({discountPercent}% savings)</span>
              )}
              {discountPercent < 0 && (
                <span className="text-xs text-amber-400">({Math.abs(discountPercent)}% premium)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lifetime Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-700">
        <span>Purchased: {balance.lifetime_purchased.toLocaleString()}</span>
        <span>Used: {balance.lifetime_used.toLocaleString()}</span>
      </div>

      {/* Low Balance Warning */}
      {lowBalance && (
        <div className="mt-4 flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-xs text-amber-300">
            Balance below threshold ({balance.low_balance_threshold} credits). Consider topping up.
          </span>
        </div>
      )}
    </div>
  );
}

// Trust Multiplier Legend Component
export function TrustMultiplierLegend({ className = '' }: { className?: string }) {
  const statuses: { status: WorkflowStatus; label: string }[] = [
    { status: 'promoted', label: 'Promoted' },
    { status: 'certified', label: 'Certified' },
    { status: 'verified', label: 'Verified' },
    { status: 'sandbox', label: 'Sandbox' },
    { status: 'under_review', label: 'Under Review' },
    { status: 'scored', label: 'Scored' },
    { status: 'tested', label: 'Tested' },
  ];

  return (
    <div className={`bg-card border border-gray-700 rounded-card p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-primary" />
        <span className="text-xs font-semibold text-gray-300">Trust = Cheaper Execution</span>
      </div>
      <div className="space-y-2">
        {statuses.map(({ status, label }) => {
          const mult = CREDIT_COST_MULTIPLIERS[status];
          if (mult === null) return null;
          const discount = Math.round((1 - mult) * 100);
          return (
            <div key={status} className="flex items-center justify-between">
              <span className="text-xs text-gray-400 capitalize">{label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  mult < 1 ? 'text-success' : mult > 1 ? 'text-amber-400' : 'text-white'
                }`}>
                  {mult}x
                </span>
                {discount !== 0 && (
                  <span className={`text-[10px] ${
                    discount > 0 ? 'text-success' : 'text-amber-400'
                  }`}>
                    {discount > 0 ? `${discount}% off` : `${Math.abs(discount)}% more`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-[10px] text-gray-500 text-center">
          Higher trust levels unlock cheaper execution rates
        </p>
      </div>
    </div>
  );
}
