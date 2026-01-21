'use client';

import { X, Coins, Check, Loader2, Gift, Zap, Shield } from 'lucide-react';
import { useCreditStore } from '@/store/creditStore';
import { CREDIT_PACKAGES, CreditPackage } from '@/types/orchestrator';

// ============================================================================
// CREDIT PURCHASE MODAL (Phase 8.1)
// ============================================================================
// Invariant I4: "No Economy Without Credits"
// Allows users to purchase execution credits
// ============================================================================

export default function CreditPurchaseModal() {
  const {
    isPurchaseModalOpen,
    selectedPackage,
    isLoading,
    balance,
    closePurchaseModal,
    selectPackage,
    purchaseCredits,
  } = useCreditStore();

  if (!isPurchaseModalOpen) return null;

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    await purchaseCredits(selectedPackage.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closePurchaseModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background
        border border-gray-700 rounded-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Coins size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Top Up Credits</h2>
                <p className="text-sm text-gray-400">Purchase execution credits</p>
              </div>
            </div>
            <button
              onClick={closePurchaseModal}
              className="p-2 hover:bg-gray-700 rounded-button transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Current Balance */}
        {balance && (
          <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Current Balance:</span>
              <span className="text-lg font-bold text-white">
                {balance.available.toLocaleString()} credits
              </span>
            </div>
          </div>
        )}

        {/* Package Selection */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                isSelected={selectedPackage?.id === pkg.id}
                onSelect={() => selectPackage(pkg)}
              />
            ))}
          </div>

          {/* Trust Economics Reminder */}
          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-purple-400" />
              <span className="text-xs font-semibold text-purple-300">Trust Economics</span>
            </div>
            <p className="text-xs text-gray-400">
              Higher certification tiers unlock cheaper execution rates.
              <span className="text-purple-300"> Promoted workflows execute at 0.5x cost</span>
              — your credits go further!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-gray-700 p-4">
          {selectedPackage && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-400">Selected Package</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{selectedPackage.name}</span>
                  <span className="text-sm text-gray-400">
                    {selectedPackage.credits.toLocaleString()} credits
                    {selectedPackage.bonus_credits && (
                      <span className="text-success ml-1">
                        +{selectedPackage.bonus_credits} bonus
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-2xl font-bold text-white">
                  RM {selectedPackage.price_myr.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={closePurchaseModal}
              className="flex-1 px-4 py-2 text-gray-400 hover:text-white
                border border-gray-700 rounded-button transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={!selectedPackage || isLoading}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-600
                text-white font-medium rounded-button transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Purchase Credits
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield size={12} />
            <span>Secure payment processing • Credits never expire</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Package Card Component
function PackageCard({
  package: pkg,
  isSelected,
  onSelect,
}: {
  package: CreditPackage;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const totalCredits = pkg.credits + (pkg.bonus_credits || 0);
  const pricePerCredit = pkg.price_myr / totalCredits;

  return (
    <button
      onClick={onSelect}
      className={`relative p-4 rounded-card border-2 text-left transition-all ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-gray-700 bg-card hover:border-gray-600'
      }`}
    >
      {/* Popular Badge */}
      {pkg.popular && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-white
          text-[10px] font-bold rounded-full">
          POPULAR
        </div>
      )}

      {/* Selection Indicator */}
      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        isSelected
          ? 'border-primary bg-primary'
          : 'border-gray-600'
      }`}>
        {isSelected && <Check size={12} className="text-white" />}
      </div>

      {/* Package Name */}
      <div className="text-lg font-bold text-white mb-1">{pkg.name}</div>

      {/* Credits */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-white">
          {pkg.credits.toLocaleString()}
        </span>
        <span className="text-sm text-gray-400">credits</span>
      </div>

      {/* Bonus Credits */}
      {pkg.bonus_credits && (
        <div className="flex items-center gap-1 mb-2 text-success">
          <Gift size={14} />
          <span className="text-sm font-medium">+{pkg.bonus_credits} bonus</span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-bold text-primary">RM {pkg.price_myr}</span>
      </div>

      {/* Price per Credit */}
      <div className="text-xs text-gray-500">
        {(pricePerCredit * 100).toFixed(1)} sen per credit
      </div>

      {/* Description */}
      {pkg.description && (
        <div className={`mt-2 text-xs ${
          pkg.popular ? 'text-primary' : 'text-gray-400'
        }`}>
          {pkg.description}
        </div>
      )}
    </button>
  );
}
