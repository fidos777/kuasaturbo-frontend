'use client';

import { useMemo } from 'react';
import { Calculator, TrendingUp, AlertTriangle, DollarSign, Percent } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { getTaskById } from '../data/tasks';

export default function CostCalculator() {
  const { nodes, calculateCostBreakdown } = useWorkflowStore();

  const costBreakdown = useMemo(() => calculateCostBreakdown(), [nodes, calculateCostBreakdown]);

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

      {/* Cost Breakdown */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Cost Breakdown
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
