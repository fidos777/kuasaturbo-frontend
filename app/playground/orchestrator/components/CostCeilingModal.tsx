'use client';

import { X, AlertTriangle, DollarSign } from 'lucide-react';

// Hardcoded ceiling for Day-3 MVP
const COST_CEILING_RM = 10.00;

interface CostCeilingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  totalCost: number;
}

export default function CostCeilingModal({ isOpen, onClose, onContinue, totalCost }: CostCeilingModalProps) {
  if (!isOpen) return null;

  const overageAmount = totalCost - COST_CEILING_RM;
  const overagePercent = Math.round((overageAmount / COST_CEILING_RM) * 100);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-background border border-amber-500/50 rounded-card shadow-2xl">
        {/* Header - Day-4 Plain English */}
        <div className="border-b border-amber-500/30 p-4 bg-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-300">⚠ Cost Warning</h2>
                <p className="text-sm text-gray-400">Cost checked before run</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-button transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Cost Display */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign size={24} className="text-amber-400" />
              <span className="text-3xl font-bold text-white">
                RM {totalCost.toFixed(2)}
              </span>
            </div>
            <p className="text-gray-400">This workflow will cost per run</p>
          </div>

          {/* Ceiling Comparison */}
          <div className="bg-card border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Your ceiling:</span>
              <span className="text-white font-medium">RM {COST_CEILING_RM.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Workflow cost:</span>
              <span className="text-amber-400 font-medium">RM {totalCost.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-error font-medium">Over ceiling:</span>
                <span className="text-error font-bold">
                  +RM {overageAmount.toFixed(2)} ({overagePercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Warning Message - Day-4 Plain English */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-200 font-medium">
              ⚠ This workflow exceeds your RM{COST_CEILING_RM.toFixed(2)} ceiling.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Each run will cost more than your recommended limit.
              You can still proceed, but costs will be higher.
            </p>
          </div>

          {/* Question */}
          <p className="text-center text-gray-300 font-medium">
            Proceed to approval anyway?
          </p>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-700 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-2 text-sm font-medium rounded-button transition-colors bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
          >
            Continue to Approval
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the ceiling constant for use in other components
export { COST_CEILING_RM };
