'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  BarChart3,
  Play,
  Edit,
  Copy,
  Archive,
  Trash2,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';

export default function MyWorkflowsPage() {
  const { savedWorkflows, loadWorkflow } = useWorkflowStore();

  // Calculate summary stats (certified = human-approved, promoted = marketplace)
  const stats = useMemo(() => {
    const active = savedWorkflows.filter(wf => wf.status === 'certified' || wf.status === 'promoted');
    const totalRuns = active.reduce((sum, wf) => sum + (wf.stats?.runs || 0), 0);
    const totalRevenue = active.reduce((sum, wf) => sum + (wf.stats?.revenue || 0), 0);
    const avgSuccess = active.length > 0
      ? active.reduce((sum, wf) => sum + (wf.stats?.successRate || 0), 0) / active.length
      : 0;

    return {
      workflows: savedWorkflows.length,
      runs: totalRuns,
      revenue: totalRevenue,
      success: Math.round(avgSuccess),
    };
  }, [savedWorkflows]);

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Workflows</h1>
              <p className="text-sm text-gray-400">Manage your certified workflows</p>
            </div>
            <Link
              href="/playground/orchestrator"
              className="px-4 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-medium
                rounded-button transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              New Workflow
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Workflows" value={stats.workflows} icon={BarChart3} />
          <StatCard label="Runs" value={stats.runs} icon={Play} />
          <StatCard
            label="Revenue"
            value={`RM ${stats.revenue.toFixed(2)}`}
            icon={TrendingUp}
            valueColor="text-success"
          />
          <StatCard
            label="Success"
            value={`${stats.success}%`}
            icon={BarChart3}
            valueColor={stats.success >= 90 ? 'text-success' : stats.success >= 80 ? 'text-warning' : 'text-error'}
          />
        </div>

        {/* Workflow List */}
        <div className="space-y-4">
          {savedWorkflows.map(workflow => (
            <WorkflowCard key={workflow.id} workflow={workflow} onLoad={loadWorkflow} />
          ))}

          {savedWorkflows.length === 0 && (
            <div className="text-center py-16 bg-card rounded-card">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
              <p className="text-gray-400 mb-4">Create your first workflow to get started</p>
              <Link
                href="/playground/orchestrator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600
                  text-white text-sm font-medium rounded-button transition-colors"
              >
                <Plus size={16} />
                Create Workflow
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  valueColor = 'text-white',
}: {
  label: string;
  value: string | number;
  icon: typeof BarChart3;
  valueColor?: string;
}) {
  return (
    <div className="bg-card rounded-card p-4">
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
        <Icon size={16} />
        {label}
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}

function WorkflowCard({
  workflow,
  onLoad,
}: {
  workflow: any;
  onLoad: (id: string) => void;
}) {
  // Blueprint v2.0: Full state machine support
  // States: draft → tested → scored → under_review → [sandbox|verified] → certified → promoted
  const isCertified = workflow.status === 'certified';
  const isPromoted = workflow.status === 'promoted';
  const isLive = isCertified || isPromoted;
  const isInProgress = ['tested', 'scored', 'under_review', 'verified'].includes(workflow.status);
  const isDraft = workflow.status === 'draft';
  const isTerminal = ['rejected', 'archived'].includes(workflow.status);

  // Get tier badge info - Blueprint v2.0 all 10 states
  const getTierBadge = () => {
    switch (workflow.status) {
      case 'promoted':
        return { label: 'PROMOTED', color: 'bg-blue-500/20 text-blue-400', icon: '🚀' };
      case 'certified':
        return { label: 'CERTIFIED', color: 'bg-success/20 text-success', icon: '✓' };
      case 'verified':
        return { label: 'VERIFIED', color: 'bg-purple-500/20 text-purple-400', icon: '🔮' };
      case 'sandbox':
        return { label: 'SANDBOX', color: 'bg-yellow-500/20 text-yellow-400', icon: '🧪' };
      case 'under_review':
        return { label: 'UNDER REVIEW', color: 'bg-amber-500/20 text-amber-400', icon: '⏳' };
      case 'scored':
        return { label: 'SCORED', color: 'bg-cyan-500/20 text-cyan-400', icon: '📊' };
      case 'tested':
        return { label: 'TESTED', color: 'bg-teal-500/20 text-teal-400', icon: '✔' };
      case 'rejected':
        return { label: 'REJECTED', color: 'bg-error/20 text-error', icon: '✗' };
      case 'archived':
        return { label: 'ARCHIVED', color: 'bg-gray-600/20 text-gray-500', icon: '📦' };
      case 'draft':
      default:
        return { label: 'DRAFT', color: 'bg-gray-700 text-gray-400', icon: '📝' };
    }
  };
  const tierBadge = getTierBadge();

  return (
    <div className="bg-card rounded-card p-4 hover:bg-card-hover transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-white">{workflow.name}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tierBadge.color}`}>
              {isLive && <span className="inline-block w-2 h-2 bg-current rounded-full mr-1 animate-pulse" />}
              {tierBadge.icon && <span className="mr-1">{tierBadge.icon}</span>}
              {tierBadge.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-3">{workflow.description || 'No description'}</p>

          {/* Stats (if certified/promoted) */}
          {isLive && workflow.stats && (
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Runs: </span>
                <span className="text-white font-medium">{workflow.stats.runs}</span>
              </div>
              <div>
                <span className="text-gray-400">Success: </span>
                <span className={`font-medium ${
                  workflow.stats.successRate >= 90 ? 'text-success' :
                  workflow.stats.successRate >= 80 ? 'text-warning' :
                  'text-error'
                }`}>
                  {workflow.stats.successRate}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">Revenue: </span>
                <span className="text-success font-medium">
                  RM {workflow.stats.revenue.toFixed(2)}
                </span>
              </div>
              {workflow.stats.lastRun && (
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={14} />
                  <span>Last run: {formatTimeAgo(workflow.stats.lastRun)}</span>
                </div>
              )}
            </div>
          )}

          {/* Status notice - Blueprint v2.0 state feedback */}
          {isDraft && (
            <p className="text-sm text-gray-500">Draft - Run simulation to progress</p>
          )}
          {isInProgress && (
            <p className="text-sm text-amber-400/80">
              {workflow.status === 'under_review' && '⏳ Awaiting Qontrek certification decision'}
              {workflow.status === 'verified' && '🔮 Mathematical verification passed - Pending certification'}
              {workflow.status === 'scored' && '📊 Metrics calculated - Ready to propose'}
              {workflow.status === 'tested' && '✔ Simulation passed - Calculate metrics next'}
            </p>
          )}
          {isTerminal && (
            <p className="text-sm text-gray-500">
              {workflow.status === 'rejected' && '✗ Rejected by Qontrek - Can restart from draft'}
              {workflow.status === 'archived' && '📦 Archived - No longer active'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {isLive ? (
            <>
              <ActionButton icon={BarChart3} label="View Stats" />
              <Link href="/playground/orchestrator">
                <ActionButton icon={Edit} label="Edit" onClick={() => onLoad(workflow.id)} />
              </Link>
              <ActionButton icon={Copy} label="Duplicate" />
              <ActionButton icon={Archive} label="Unpublish" variant="warning" />
            </>
          ) : (
            <>
              <Link href="/playground/orchestrator">
                <ActionButton icon={Edit} label="Edit" onClick={() => onLoad(workflow.id)} />
              </Link>
              <ActionButton icon={Trash2} label="Delete" variant="danger" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  variant = 'default',
  onClick,
}: {
  icon: typeof Edit;
  label: string;
  variant?: 'default' | 'warning' | 'danger';
  onClick?: () => void;
}) {
  const colors = {
    default: 'hover:bg-gray-700 text-gray-400 hover:text-white',
    warning: 'hover:bg-warning/20 text-gray-400 hover:text-warning',
    danger: 'hover:bg-error/20 text-gray-400 hover:text-error',
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-button transition-colors ${colors[variant]}`}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
}
