'use client';

// ============================================================================
// GOVERNANCE ACTIVITY FEED COMPONENT
// Sprint 3: QPI Dashboard - Real-time governance event stream
// ============================================================================
// Invariant I5: "No Silence Without Signal" — Every interaction produces a trace
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  RefreshCw,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { MalaysianSector, MALAYSIAN_SECTORS } from '@/types/qpi';

// Activity Types
type GovernanceActivityType =
  | 'proof_generated'
  | 'proof_verified'
  | 'proof_disputed'
  | 'trust_level_changed'
  | 'workflow_promoted'
  | 'workflow_demoted'
  | 'audit_completed'
  | 'compliance_check'
  | 'credit_consumed'
  | 'sector_alert';

// Activity severity
type ActivitySeverity = 'info' | 'success' | 'warning' | 'error';

// Activity record
interface GovernanceActivity {
  id: string;
  type: GovernanceActivityType;
  severity: ActivitySeverity;
  timestamp: string;
  sector?: MalaysianSector;
  workflowId?: string;
  userId?: string;
  message: string;
  details?: Record<string, unknown>;
}

interface GovernanceActivityFeedProps {
  activities?: GovernanceActivity[];
  maxItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  filterBySector?: MalaysianSector | null;
  variant?: 'full' | 'compact' | 'minimal';
}

// Generate sample activities for demo
function generateSampleActivities(count: number): GovernanceActivity[] {
  const types: GovernanceActivityType[] = [
    'proof_generated',
    'proof_verified',
    'proof_disputed',
    'trust_level_changed',
    'workflow_promoted',
    'audit_completed',
    'compliance_check',
    'credit_consumed',
  ];

  const sectors = Object.keys(MALAYSIAN_SECTORS) as MalaysianSector[];

  const messages: Record<GovernanceActivityType, string[]> = {
    proof_generated: [
      'New execution proof generated for workflow',
      'Verification proof created for task completion',
      'Audit proof recorded for compliance check',
    ],
    proof_verified: [
      'Proof chain verified successfully',
      'Execution proof passed validation',
      'Compliance proof confirmed',
    ],
    proof_disputed: [
      'Proof integrity dispute raised',
      'Verification mismatch detected',
      'Audit trail inconsistency flagged',
    ],
    trust_level_changed: [
      'Trust level upgraded to certified',
      'Trust level changed from sandbox to tested',
      'Trust score recalculated',
    ],
    workflow_promoted: [
      'Workflow promoted to production status',
      'Agent elevated to certified tier',
      'Service approved for pilot deployment',
    ],
    workflow_demoted: [
      'Workflow demoted due to compliance failure',
      'Agent reverted to sandbox mode',
      'Service suspended pending review',
    ],
    audit_completed: [
      'Quarterly audit completed successfully',
      'Compliance review finalized',
      'Third-party audit certification received',
    ],
    compliance_check: [
      'PDPA compliance check passed',
      'BNM guidelines verification complete',
      'MSC status requirements validated',
    ],
    credit_consumed: [
      'Execution credits consumed for workflow run',
      'Credits deducted for premium API call',
      'Batch processing credits applied',
    ],
    sector_alert: [
      'Sector-wide trust score threshold breached',
      'Multiple workflow failures detected in sector',
      'Regulatory update affecting sector compliance',
    ],
  };

  const getSeverity = (type: GovernanceActivityType): ActivitySeverity => {
    switch (type) {
      case 'proof_verified':
      case 'workflow_promoted':
      case 'audit_completed':
        return 'success';
      case 'proof_disputed':
      case 'workflow_demoted':
      case 'sector_alert':
        return 'error';
      case 'trust_level_changed':
      case 'compliance_check':
        return 'warning';
      default:
        return 'info';
    }
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const typeMessages = messages[type];
    const message = typeMessages[Math.floor(Math.random() * typeMessages.length)];

    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - i * Math.floor(Math.random() * 30 + 5));

    return {
      id: `activity-${Date.now()}-${i}`,
      type,
      severity: getSeverity(type),
      timestamp: timestamp.toISOString(),
      sector,
      workflowId: `wf-${Math.random().toString(36).substr(2, 8)}`,
      userId: `user-${Math.floor(Math.random() * 100)}`,
      message,
      details: {
        creditsUsed: type === 'credit_consumed' ? Math.floor(Math.random() * 100 + 10) : undefined,
        previousLevel: type === 'trust_level_changed' ? 'sandbox' : undefined,
        newLevel: type === 'trust_level_changed' ? 'certified' : undefined,
      },
    };
  });
}

export default function GovernanceActivityFeed({
  activities: providedActivities,
  maxItems = 20,
  autoRefresh = false,
  refreshInterval = 30000,
  filterBySector = null,
  variant = 'full',
}: GovernanceActivityFeedProps) {
  const [activities, setActivities] = useState<GovernanceActivity[]>(
    providedActivities || generateSampleActivities(maxItems)
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<GovernanceActivityType>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setIsRefreshing(true);
      // Simulate refresh with new activities
      const newActivity = generateSampleActivities(1)[0];
      setActivities((prev) => [newActivity, ...prev.slice(0, maxItems - 1)]);
      setTimeout(() => setIsRefreshing(false), 500);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, maxItems]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (filterBySector) {
      filtered = filtered.filter((a) => a.sector === filterBySector);
    }

    if (selectedTypes.size > 0) {
      filtered = filtered.filter((a) => selectedTypes.has(a.type));
    }

    return filtered.slice(0, maxItems);
  }, [activities, filterBySector, selectedTypes, maxItems]);

  // Get icon for activity type
  const getActivityIcon = (type: GovernanceActivityType, severity: ActivitySeverity) => {
    const iconClass = {
      info: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
    }[severity];

    switch (type) {
      case 'proof_generated':
      case 'proof_verified':
        return <CheckCircle2 className={`w-4 h-4 ${iconClass}`} />;
      case 'proof_disputed':
        return <XCircle className={`w-4 h-4 ${iconClass}`} />;
      case 'trust_level_changed':
      case 'workflow_promoted':
      case 'workflow_demoted':
        return <Shield className={`w-4 h-4 ${iconClass}`} />;
      case 'audit_completed':
      case 'compliance_check':
        return <Activity className={`w-4 h-4 ${iconClass}`} />;
      case 'sector_alert':
        return <AlertTriangle className={`w-4 h-4 ${iconClass}`} />;
      default:
        return <Clock className={`w-4 h-4 ${iconClass}`} />;
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Toggle type filter
  const toggleTypeFilter = (type: GovernanceActivityType) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);
  };

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className="space-y-1">
        {filteredActivities.slice(0, 5).map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-2 text-xs text-gray-400"
          >
            {getActivityIcon(activity.type, activity.severity)}
            <span className="truncate flex-1">{activity.message}</span>
            <span className="text-gray-500">{formatRelativeTime(activity.timestamp)}</span>
          </div>
        ))}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Governance Activity
          </h4>
          {isRefreshing && (
            <RefreshCw className="w-3 h-3 text-purple-400 animate-spin" />
          )}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-2 p-2 bg-gray-800/50 rounded-lg"
            >
              <div className="mt-0.5">
                {getActivityIcon(activity.type, activity.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{activity.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {activity.sector && (
                    <span>{MALAYSIAN_SECTORS[activity.sector].name}</span>
                  )}
                  <span>•</span>
                  <span>{formatRelativeTime(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-medium text-white">Governance Activity Feed</h3>
          {isRefreshing && (
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              showFilters || selectedTypes.size > 0
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Filter className="w-3 h-3" />
            Filter
            {selectedTypes.size > 0 && (
              <span className="ml-1 px-1.5 bg-white/20 rounded-full">
                {selectedTypes.size}
              </span>
            )}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Refresh button */}
          <button
            onClick={() => {
              setIsRefreshing(true);
              setActivities(generateSampleActivities(maxItems));
              setTimeout(() => setIsRefreshing(false), 500);
            }}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Filter by type:</div>
          <div className="flex flex-wrap gap-2">
            {[
              'proof_generated',
              'proof_verified',
              'proof_disputed',
              'trust_level_changed',
              'workflow_promoted',
              'audit_completed',
              'compliance_check',
              'credit_consumed',
            ].map((type) => (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type as GovernanceActivityType)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedTypes.has(type as GovernanceActivityType)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          {selectedTypes.size > 0 && (
            <button
              onClick={() => setSelectedTypes(new Set())}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Activity list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-gray-800/30 rounded-lg">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activities match your filters</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`p-3 rounded-lg border transition-colors ${
                activity.severity === 'error'
                  ? 'bg-red-500/5 border-red-500/20'
                  : activity.severity === 'warning'
                  ? 'bg-yellow-500/5 border-yellow-500/20'
                  : activity.severity === 'success'
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="mt-0.5">
                  {getActivityIcon(activity.type, activity.severity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{activity.message}</p>

                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {activity.sector && (
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {MALAYSIAN_SECTORS[activity.sector].name}
                      </span>
                    )}
                    {activity.userId && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {activity.userId}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>

                  {/* Additional details */}
                  {activity.details?.creditsUsed !== undefined && (
                    <div className="mt-2 text-xs text-yellow-400">
                      Credits used: {String(activity.details.creditsUsed)}
                    </div>
                  )}
                  {activity.details?.previousLevel !== undefined && activity.details?.newLevel !== undefined && (
                    <div className="mt-2 text-xs text-purple-400">
                      {String(activity.details.previousLevel)} → {String(activity.details.newLevel)}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleTimeString('en-MY', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
        <span>
          Showing {filteredActivities.length} of {activities.length} activities
        </span>
        <span>Invariant I5: Every interaction produces a trace</span>
      </div>
    </div>
  );
}
