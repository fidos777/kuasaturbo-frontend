/**
 * Decision Log Viewer
 *
 * Sprint 6.5: Human Accountability Layer
 *
 * "Sangat disukai regulator"
 *
 * Shows:
 * - Who certified what
 * - Reason text (justification)
 * - Timestamp + proofHash
 * - Full audit trail
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useDecisionStore } from '../../store/decisionStore';
import {
  DECISION_TYPE_LABELS,
  DECISION_TYPE_COLORS,
  GATE_TYPE_LABELS,
  GATE_TYPE_COLORS,
  AUTHORITY_LEVELS,
} from '../../types/decision';
import type { DecisionLogEntry, DecisionJustification, DecisionType, DecisionGateType } from '../../types/decision';

// ============================================================================
// FILTER COMPONENT
// ============================================================================

interface LogFilterProps {
  filter: {
    decision_type?: DecisionType;
    gate_type?: DecisionGateType;
    status?: 'signed' | 'revoked';
  };
  onFilterChange: (filter: LogFilterProps['filter']) => void;
}

function LogFilter({ filter, onFilterChange }: LogFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filter.decision_type || ''}
        onChange={(e) => onFilterChange({ ...filter, decision_type: e.target.value as DecisionType || undefined })}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Decision Types</option>
        {Object.entries(DECISION_TYPE_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <select
        value={filter.gate_type || ''}
        onChange={(e) => onFilterChange({ ...filter, gate_type: e.target.value as DecisionGateType || undefined })}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Gate Types</option>
        {Object.entries(GATE_TYPE_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <select
        value={filter.status || ''}
        onChange={(e) => onFilterChange({ ...filter, status: e.target.value as 'signed' | 'revoked' || undefined })}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Status</option>
        <option value="signed">Signed</option>
        <option value="revoked">Revoked</option>
      </select>
    </div>
  );
}

// ============================================================================
// LOG ENTRY ROW
// ============================================================================

interface LogEntryRowProps {
  entry: DecisionLogEntry;
  onClick: () => void;
}

function LogEntryRow({ entry, onClick }: LogEntryRowProps) {
  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: GATE_TYPE_COLORS[entry.gate_type] }}
          />
          <span className="font-medium text-gray-900">{entry.workflow_name}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {entry.transition}
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className="px-2 py-1 text-xs font-medium rounded"
          style={{
            backgroundColor: `${DECISION_TYPE_COLORS[entry.decision_type]}15`,
            color: DECISION_TYPE_COLORS[entry.decision_type],
          }}
        >
          {DECISION_TYPE_LABELS[entry.decision_type]}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{entry.authority_name}</div>
        <div className="text-xs text-gray-500">
          Level {entry.authority_level} ({AUTHORITY_LEVELS[entry.authority_level]})
        </div>
      </td>
      <td className="px-4 py-3 max-w-xs">
        <p className="text-sm text-gray-600 truncate">{entry.justification_preview}</p>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(entry.signed_at).toLocaleString('en-MY', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            entry.status === 'signed'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {entry.status === 'signed' ? '✓ Signed' : '✗ Revoked'}
        </span>
      </td>
    </tr>
  );
}

// ============================================================================
// DETAIL MODAL
// ============================================================================

interface DecisionDetailModalProps {
  decision: DecisionJustification;
  onClose: () => void;
}

function DecisionDetailModal({ decision, onClose }: DecisionDetailModalProps) {
  const [showFullHash, setShowFullHash] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <h3 className="font-bold text-gray-900">Decision Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)] space-y-6">
          {/* Status Banner */}
          <div
            className={`px-4 py-3 rounded-xl ${
              decision.status === 'signed'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-medium ${
                decision.status === 'signed' ? 'text-green-700' : 'text-red-700'
              }`}>
                {decision.status === 'signed' ? '✓ Decision Signed' : '✗ Decision Revoked'}
              </span>
              <span className="text-sm text-gray-500">
                {decision.signed_at && new Date(decision.signed_at).toLocaleString('en-MY')}
              </span>
            </div>
            {decision.status === 'revoked' && decision.revocation_reason && (
              <p className="text-sm text-red-600 mt-2">
                Reason: {decision.revocation_reason}
              </p>
            )}
          </div>

          {/* Workflow Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Workflow</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400">Name</span>
                <p className="font-medium text-gray-900">{decision.workflow_name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Transition</span>
                <p className="font-medium text-gray-900">
                  {decision.from_state} → {decision.to_state}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Trust Score</span>
                <p className={`font-medium ${
                  decision.trust_score >= 0.7 ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {(decision.trust_score * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Credit Cost</span>
                <p className="font-medium text-gray-900">{decision.credit_cost} RC</p>
              </div>
            </div>
          </div>

          {/* Decision Type */}
          <div className="flex gap-3">
            <span
              className="px-3 py-1.5 text-sm font-medium rounded-lg"
              style={{
                backgroundColor: `${DECISION_TYPE_COLORS[decision.decision_type]}15`,
                color: DECISION_TYPE_COLORS[decision.decision_type],
              }}
            >
              {DECISION_TYPE_LABELS[decision.decision_type]}
            </span>
            <span
              className="px-3 py-1.5 text-sm font-medium rounded-lg"
              style={{
                backgroundColor: `${GATE_TYPE_COLORS[decision.gate_type]}15`,
                color: GATE_TYPE_COLORS[decision.gate_type],
              }}
            >
              {decision.gate_type}
            </span>
          </div>

          {/* Justification (THE IMPORTANT PART) */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Justification</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{decision.justification_text}</p>
          </div>

          {/* Accountability Confirmations */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className={decision.liability_accepted ? 'text-green-600' : 'text-red-600'}>
                {decision.liability_accepted ? '✓' : '✗'}
              </span>
              <span className="text-gray-700">Liability Accepted</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={decision.proof_reviewed ? 'text-green-600' : 'text-red-600'}>
                {decision.proof_reviewed ? '✓' : '✗'}
              </span>
              <span className="text-gray-700">Proof Chain Reviewed</span>
            </div>
          </div>

          {/* Authority */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Signing Authority</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400">Name</span>
                <p className="font-medium text-gray-900">{decision.authority.user_name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Role</span>
                <p className="font-medium text-gray-900">{decision.authority.role}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Authority Level</span>
                <p className="font-medium text-gray-900">
                  Level {decision.authority.authority_level} ({AUTHORITY_LEVELS[decision.authority.authority_level]})
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">User ID</span>
                <p className="font-mono text-sm text-gray-600">{decision.authority.user_id}</p>
              </div>
            </div>
          </div>

          {/* Proof Hash (Audit Critical) */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Proof Chain</h4>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-purple-600">Proof Hash</span>
                <p
                  className="font-mono text-sm text-purple-900 cursor-pointer hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                  onClick={() => setShowFullHash(!showFullHash)}
                >
                  {showFullHash ? decision.proof_hash : `${decision.proof_hash.slice(0, 20)}...`}
                </p>
              </div>
              {decision.previous_hash && (
                <div>
                  <span className="text-xs text-purple-600">Previous Hash</span>
                  <p className="font-mono text-sm text-purple-700">
                    {decision.previous_hash.slice(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Created: {new Date(decision.created_at).toLocaleString('en-MY')}</span>
            {decision.signed_at && (
              <span>Signed: {new Date(decision.signed_at).toLocaleString('en-MY')}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface DecisionLogViewerProps {
  workflowId?: string;
  limit?: number;
  compact?: boolean;
}

export function DecisionLogViewer({ workflowId, limit = 50, compact = false }: DecisionLogViewerProps) {
  const { decisions, getDecisionLog, getDecisionById } = useDecisionStore();
  const [filter, setFilter] = useState<{
    decision_type?: DecisionType;
    gate_type?: DecisionGateType;
    status?: 'signed' | 'revoked';
  }>({});
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  // Get filtered log
  const logEntries = useMemo(() => {
    return getDecisionLog({
      workflow_id: workflowId,
      ...filter,
      limit,
    });
  }, [getDecisionLog, workflowId, filter, limit, decisions]);

  // Get selected decision for detail modal
  const selectedDecision = selectedDecisionId
    ? getDecisionById(selectedDecisionId)
    : null;

  // Stats
  const stats = useMemo(() => {
    const total = decisions.length;
    const signed = decisions.filter((d) => d.status === 'signed').length;
    const revoked = decisions.filter((d) => d.status === 'revoked').length;
    const todayCount = decisions.filter((d) => {
      const today = new Date();
      const signedDate = d.signed_at ? new Date(d.signed_at) : null;
      return signedDate && signedDate.toDateString() === today.toDateString();
    }).length;

    return { total, signed, revoked, todayCount };
  }, [decisions]);

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Decision Log</h2>
            <p className="text-sm text-gray-500">
              Audit trail of all governance decisions
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
              <p className="text-gray-500">Signed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.todayCount}</p>
              <p className="text-gray-500">Today</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      {!compact && (
        <LogFilter filter={filter} onFilterChange={setFilter} />
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {logEntries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No decisions recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Decisions will appear here when workflows are certified
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workflow
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Decision
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Authority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Justification
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logEntries.map((entry) => (
                  <LogEntryRow
                    key={entry.id}
                    entry={entry}
                    onClick={() => setSelectedDecisionId(entry.decision_id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDecision && (
        <DecisionDetailModal
          decision={selectedDecision}
          onClose={() => setSelectedDecisionId(null)}
        />
      )}
    </div>
  );
}

export default DecisionLogViewer;
