'use client';

import { useMemo } from 'react';
import { Calculator, TrendingUp, AlertTriangle, Coins, Zap, TrendingDown } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { useCreditStore } from '@/store/creditStore';
import { getTaskById } from '../data/tasks';
import { CREDIT_COST_MULTIPLIERS, WorkflowStatus } from '@/types/orchestrator';

export default function CostCalculator() {
  const { nodes, calculateCostBreakdown, currentWorkflow } = useWorkflowStore();
  const { balance, calculateWorkflowCost, checkCredits } = useCreditStore();

  const costBreakdown = useMemo(() => calculateCostBreakdown(), [nodes, calculateCostBreakdown]);

  // Get current workflow status (default to sandbox for new workflows)
  const workflowStatus: WorkflowStatus = currentWorkflow?.status || 'sandbox';

  // Calculate credit cost with trust multiplier
  const creditEstimate = useMemo(() => {
    // Convert RM cost to credits (1 credit = RM 0.10)
    const baseCredits = Math.ceil(costBreakdown.subtotal * 10);
    return calculateWorkflowCost(baseCredits, workflowStatus);
  }, [costBreakdown.subtotal, workflowStatus, calculateWorkflowCost]);

  // Check if user has enough credits
  const creditCheck = useMemo(() => {
    if (!creditEstimate) return null;
    return checkCredits(creditEstimate.final_cost);
  }, [creditEstimate, checkCredits]);

  // Calculate estimated success rate
  const estimatedSuccessRate = useMemo(() => {
    if (nodes.length === 0) return 100;
    const rates = nodes.map(node => {
      const task = getTaskById(node.taskId);
      return task?.successRate || 100;
    });
    return Math.round(rates.reduce((a, b) => (a * b) / 100, 100));
  }, [nodes]);

  // Calculate estimated time
  const estimatedTime = useMemo(() => {
    return nodes.reduce((total, node) => {
      const task = getTaskById(node.taskId);
      if (!task) return total;
      return total + (task.avgDuration.min + task.avgDuration.max) / 2;
    }, 0);
  }, [nodes]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Calculator size={20} className="text-primary" />
          Workflow Summary
        </h2>
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-card p-3">
            <div className="text-xs text-gray-400 mb-1">Tasks</div>
            <div className="text-2xl font-bold text-white">{nodes.length}</div>
          </div>
          <div className="bg-card rounded-card p-3">
            <div className="text-xs text-gray-400 mb-1">Est. Cost</div>
            <div className="text-2xl font-bold text-secondary">
              RM {costBreakdown.subtotal.toFixed(2)}
            </div>
          </div>
          <div className="bg-card rounded-card p-3">
            <div className="text-xs text-gray-400 mb-1">Est. Time</div>
            <div className="text-xl font-bold text-white">
              {estimatedTime.toFixed(1)}s
            </div>
          </div>
          <div className="bg-card rounded-card p-3">
            <div className="text-xs text-gray-400 mb-1">Success</div>
            <div className={`text-xl font-bold ${
              estimatedSuccessRate >= 90 ? 'text-success' :
              estimatedSuccessRate >= 80 ? 'text-warning' :
              'text-error'
            }`}>
              ~{estimatedSuccessRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Credit Cost Section (Phase 8.1) */}
      {nodes.length > 0 && creditEstimate && (
        <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Coins size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-gray-300">Execution Credits</h3>
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
              Phase 8.1
            </span>
          </div>

          {/* Credit Cost Display */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-card/50 rounded-lg p-2">
              <div className="text-[10px] text-gray-400 mb-1">Base Cost</div>
              <div className="text-lg font-bold text-white">
                {creditEstimate.base_cost} <span className="text-xs text-gray-400">credits</span>
              </div>
            </div>
            <div className="bg-card/50 rounded-lg p-2">
              <div className="text-[10px] text-gray-400 mb-1">Final Cost</div>
              <div className={`text-lg font-bold ${
                creditEstimate.savings_from_trust > 0 ? 'text-success' : 'text-white'
              }`}>
                {creditEstimate.final_cost} <span className="text-xs text-gray-400">credits</span>
              </div>
            </div>
          </div>

          {/* Trust Multiplier */}
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg mb-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-purple-400" />
              <span className="text-xs text-gray-400">Trust Multiplier</span>
              <span className="text-xs text-gray-500 capitalize">
                ({workflowStatus.replace('_', ' ')})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${
                creditEstimate.trust_multiplier < 1 ? 'text-success' :
                creditEstimate.trust_multiplier > 1 ? 'text-amber-400' :
                'text-white'
              }`}>
                {creditEstimate.trust_multiplier}x
              </span>
              {creditEstimate.savings_from_trust > 0 && (
                <span className="flex items-center gap-1 text-xs text-success">
                  <TrendingDown size={12} />
                  {creditEstimate.trust_discount_percent}% off
                </span>
              )}
              {creditEstimate.trust_discount_percent < 0 && (
                <span className="text-xs text-amber-400">
                  +{Math.abs(creditEstimate.trust_discount_percent)}% premium
                </span>
              )}
            </div>
          </div>

          {/* Credit Balance Check */}
          {creditCheck && (
            <div className={`flex items-center justify-between p-2 rounded-lg ${
              creditCheck.can_execute
                ? 'bg-success/10 border border-success/20'
                : 'bg-error/10 border border-error/20'
            }`}>
              <div className="flex items-center gap-2">
                <Coins size={14} className={creditCheck.can_execute ? 'text-success' : 'text-error'} />
                <span className={`text-xs ${creditCheck.can_execute ? 'text-success' : 'text-error'}`}>
                  {creditCheck.can_execute
                    ? `Sufficient credits (${creditCheck.available_credits} available)`
                    : `Need ${creditCheck.shortfall} more credits`
                  }
                </span>
              </div>
              {!creditCheck.can_execute && (
                <button
                  onClick={() => useCreditStore.getState().openPurchaseModal(creditCheck.suggested_package)}
                  className="text-xs px-2 py-1 bg-primary hover:bg-primary-600 text-white
                    rounded-button transition-colors"
                >
                  Top Up
                </button>
              )}
            </div>
          )}

          {/* Trust Economics Note */}
          <p className="text-[10px] text-gray-500 mt-2">
            Higher certification tiers unlock cheaper execution rates
          </p>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Cost Breakdown (RM)
        </h3>

        {costBreakdown.taskCosts.length > 0 ? (
          <div className="space-y-2">
            {costBreakdown.taskCosts.map((tc, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">
                  {tc.taskId} {tc.taskName}
                </span>
                <span className="text-white font-medium">
                  RM {tc.cost.toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t border-gray-700 pt-2 mt-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-white">RM {costBreakdown.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4 text-sm">
            Add tasks to see cost breakdown
          </div>
        )}
      </div>

      {/* Revenue Split */}
      {nodes.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-card/50">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            <TrendingUp size={16} className="text-success" />
            Revenue Split
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Execution (50%)</span>
              <span className="text-gray-300">RM {costBreakdown.executionCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Platform (30%)</span>
              <span className="text-gray-300">RM {costBreakdown.platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span className="text-success">Your Cut (20%)</span>
              <span className="text-success">RM {costBreakdown.designerCut.toFixed(2)}</span>
            </div>
          </div>

          {/* Revenue Projection */}
          <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-card">
            <h4 className="text-xs font-semibold text-primary mb-2">Revenue Projection</h4>
            <p className="text-sm text-gray-300">
              If <span className="text-white font-medium">100 runs/month</span>:
            </p>
            <p className="text-lg font-bold text-success">
              RM {(costBreakdown.designerCut * 100).toFixed(2)}/month
            </p>
          </div>

          {/* Failure Visibility - Economics Transparency */}
          {estimatedSuccessRate < 100 && (
            <div className="mt-3 p-3 bg-error/10 border border-error/30 rounded-card">
              <h4 className="text-xs font-semibold text-error mb-2 flex items-center gap-1">
                <AlertTriangle size={12} />
                Failure Visibility
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. failure rate</span>
                  <span className="text-error">{(100 - estimatedSuccessRate).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost per failed run</span>
                  <span className="text-gray-300">RM {costBreakdown.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-error">Est. monthly waste (100 runs)</span>
                  <span className="text-error">
                    RM {((costBreakdown.subtotal * (100 - estimatedSuccessRate))).toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Failed runs still consume API credits. Optimize for higher success rates.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Constitutional Reminder */}
      <div className="p-4 border-t border-gray-700 bg-warning/5">
        <div className="flex items-start gap-2 text-xs text-warning">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">REMINDER</p>
            <p className="text-gray-400">
              Workflows produce <span className="text-warning">outputs</span>, not decisions.
              Human review required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
