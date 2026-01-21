/**
 * Decision Justification Panel
 *
 * Sprint 6.5: Human Accountability Layer
 *
 * "Decision Justification = Ritual, Not UI"
 *
 * This panel intentionally:
 * - Slows down the decision (on purpose)
 * - Forces risk awareness
 * - Makes certification an act of liability
 *
 * Required for Type-B, Type-C, Type-Z decisions
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDecisionStore } from '../../store/decisionStore';
import {
  validateDecision,
  DECISION_TYPE_LABELS,
  DECISION_TYPE_COLORS,
  GATE_TYPE_LABELS,
  GATE_TYPE_COLORS,
  AUTHORITY_LEVELS,
  MIN_JUSTIFICATION_LENGTH,
} from '../../types/decision';
import type { DecisionContext, DecisionJustification } from '../../types/decision';

// ============================================================================
// MOCK AUTHORITY (Replace with actual auth system)
// ============================================================================

const MOCK_AUTHORITY = {
  user_id: 'user_001',
  user_name: 'Ahmad Razak',
  authority_level: 3,
  role: 'Operations Manager',
};

// ============================================================================
// COMPONENT
// ============================================================================

interface DecisionJustificationPanelProps {
  context?: DecisionContext;
  onComplete?: (result: { success: boolean; decision_id?: string }) => void;
  onCancel?: () => void;
}

export function DecisionJustificationPanel({
  context: externalContext,
  onComplete,
  onCancel,
}: DecisionJustificationPanelProps) {
  const {
    showPanel,
    currentContext,
    pendingDecision,
    isSubmitting,
    error,
    updatePendingDecision,
    submitDecision,
    closeDecisionPanel,
  } = useDecisionStore();

  // Use external context or store context
  const context = externalContext || currentContext;

  // Local state
  const [justificationText, setJustificationText] = useState('');
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);
  const [proofReviewed, setProofReviewed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Sync with pending decision
  useEffect(() => {
    if (pendingDecision) {
      setJustificationText(pendingDecision.justification_text || '');
      setLiabilityAccepted(pendingDecision.liability_accepted || false);
      setProofReviewed(pendingDecision.proof_reviewed || false);
    }
  }, [pendingDecision]);

  // Update pending decision on change
  useEffect(() => {
    updatePendingDecision({
      justification_text: justificationText,
      liability_accepted: liabilityAccepted,
      proof_reviewed: proofReviewed,
      authority: MOCK_AUTHORITY,
    });
  }, [justificationText, liabilityAccepted, proofReviewed, updatePendingDecision]);

  // Validation
  const validation = useMemo(() => {
    if (!context || !pendingDecision) return null;
    return validateDecision(
      { ...pendingDecision, justification_text: justificationText, liability_accepted: liabilityAccepted, proof_reviewed: proofReviewed, authority: MOCK_AUTHORITY },
      context
    );
  }, [context, pendingDecision, justificationText, liabilityAccepted, proofReviewed]);

  // Can submit?
  const canSubmit = validation?.valid && justificationText.length >= MIN_JUSTIFICATION_LENGTH;

  // Handle close
  const handleClose = () => {
    setJustificationText('');
    setLiabilityAccepted(false);
    setProofReviewed(false);
    setShowConfirmation(false);
    closeDecisionPanel();
    onCancel?.();
  };

  // Handle submit
  const handleSubmit = async () => {
    const result = await submitDecision();
    if (result.success) {
      setJustificationText('');
      setLiabilityAccepted(false);
      setProofReviewed(false);
      setShowConfirmation(false);
      onComplete?.({ success: true, decision_id: result.decision_id });
    }
  };

  // Don't render if not showing and no external context
  if (!showPanel && !externalContext) return null;
  if (!context) return null;

  const minLength = context.min_justification_length || MIN_JUSTIFICATION_LENGTH;
  const charCount = justificationText.length;
  const charRemaining = Math.max(0, minLength - charCount);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-5 border-b"
          style={{ backgroundColor: `${GATE_TYPE_COLORS[context.gate_type]}10` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Decision Justification
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded"
                  style={{
                    backgroundColor: `${GATE_TYPE_COLORS[context.gate_type]}20`,
                    color: GATE_TYPE_COLORS[context.gate_type],
                  }}
                >
                  {context.gate_type}
                </span>
                <span className="text-sm text-gray-500">
                  {GATE_TYPE_LABELS[context.gate_type]}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Workflow Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Workflow Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400">Workflow</span>
                <p className="font-medium text-gray-900">{context.workflow_name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Transition</span>
                <p className="font-medium text-gray-900">
                  <span className="text-gray-500">{context.current_state}</span>
                  <span className="mx-2">→</span>
                  <span className="text-blue-600">{context.target_state}</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Trust Score</span>
                <p className={`font-medium ${
                  context.trust_score >= 0.7 ? 'text-green-600' :
                  context.trust_score >= 0.5 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {(context.trust_score * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Credit Cost</span>
                <p className="font-medium text-gray-900">{context.credit_cost} RC</p>
              </div>
            </div>
          </div>

          {/* Decision Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Decision Type</h3>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                backgroundColor: `${DECISION_TYPE_COLORS[context.decision_type]}15`,
                color: DECISION_TYPE_COLORS[context.decision_type],
              }}
            >
              <span className="font-medium">{DECISION_TYPE_LABELS[context.decision_type]}</span>
            </div>
          </div>

          {/* THE RITUAL: Justification Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I certify this decision because:
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={justificationText}
              onChange={(e) => setJustificationText(e.target.value)}
              placeholder="Explain your reasoning for this decision. What evidence have you reviewed? What risks have you considered? Why is this action appropriate?"
              className={`w-full h-32 px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:outline-none transition-colors ${
                charCount >= minLength
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
            <div className="flex justify-between mt-2 text-xs">
              <span className={charCount >= minLength ? 'text-green-600' : 'text-gray-400'}>
                {charCount >= minLength ? '✓ Minimum met' : `${charRemaining} more characters required`}
              </span>
              <span className="text-gray-400">{charCount} characters</span>
            </div>
          </div>

          {/* THE RITUAL: Checkboxes */}
          <div className="space-y-4 bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h3 className="text-sm font-medium text-amber-800">Accountability Confirmation</h3>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={liabilityAccepted}
                onChange={(e) => setLiabilityAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                <strong>I accept liability for this decision.</strong>
                <br />
                <span className="text-gray-500">
                  I understand this action will be permanently recorded and linked to my identity.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={proofReviewed}
                onChange={(e) => setProofReviewed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                <strong>I have reviewed the proof chain.</strong>
                <br />
                <span className="text-gray-500">
                  I have examined {context.proof_count} proof(s) supporting this workflow.
                </span>
              </span>
            </label>
          </div>

          {/* Authority Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Signing Authority</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-600">Name</span>
                <p className="font-medium text-blue-900">{MOCK_AUTHORITY.user_name}</p>
              </div>
              <div>
                <span className="text-blue-600">Role</span>
                <p className="font-medium text-blue-900">{MOCK_AUTHORITY.role}</p>
              </div>
              <div>
                <span className="text-blue-600">Authority Level</span>
                <p className="font-medium text-blue-900">
                  Level {MOCK_AUTHORITY.authority_level} ({AUTHORITY_LEVELS[MOCK_AUTHORITY.authority_level]})
                </p>
              </div>
              <div>
                <span className="text-blue-600">Timestamp</span>
                <p className="font-medium text-blue-900">
                  {new Date().toLocaleString('en-MY')}
                </p>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validation && validation.errors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h4 className="text-sm font-medium text-red-800 mb-2">Cannot Submit</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {validation.errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation Warnings */}
          {validation && validation.warnings.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="text-sm font-medium text-amber-800 mb-2">⚠️ Warnings</h4>
              <ul className="text-sm text-amber-600 space-y-1">
                {validation.warnings.map((warn, i) => (
                  <li key={i}>• {warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Error from submission */}
          {error && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-sm text-red-600">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          {!showConfirmation ? (
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={!canSubmit || isSubmitting}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                canSubmit
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Review & Sign
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing...
                  </>
                ) : (
                  <>✓ Certify & Sign</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DecisionJustificationPanel;
