/**
 * PIL Constraints Hook
 *
 * Integration hook for using PIL constraints in workflow execution.
 * Part of Sprint 5: PIL Framework
 */

import { useCallback } from 'react';
import { usePILStore } from '../store/pilStore';
import type {
  PILContext,
  InvariantId,
  InvariantCheckResult,
  AllInvariantsResult,
  WorkflowState,
  TransitionValidationResult,
  GateType,
  GateEvaluationResult,
} from '../types/pil';

export interface UsePILConstraintsReturn {
  // Invariant checking
  checkInvariant: (id: InvariantId, context: PILContext) => InvariantCheckResult;
  checkAllInvariants: (context: PILContext) => AllInvariantsResult;

  // State transitions
  validateTransition: (
    from: WorkflowState,
    to: WorkflowState,
    context: PILContext
  ) => TransitionValidationResult;
  canTransition: (from: WorkflowState, to: WorkflowState, context: PILContext) => boolean;

  // Gate evaluation
  evaluateGate: (type: GateType, context: PILContext) => GateEvaluationResult;
  getRecommendedGate: (context: PILContext) => GateType;

  // Metrics
  calculateTrustScore: (context: PILContext) => number;
  calculateProofDelta: (expected: number, actual: number) => number;

  // Last validation result
  lastValidation: AllInvariantsResult | null;
}

export function usePILConstraints(): UsePILConstraintsReturn {
  const store = usePILStore();

  const checkInvariant = useCallback(
    (id: InvariantId, context: PILContext) => {
      return store.checkInvariant(id, context);
    },
    [store]
  );

  const checkAllInvariants = useCallback(
    (context: PILContext) => {
      return store.checkAllInvariants(context);
    },
    [store]
  );

  const validateTransition = useCallback(
    (from: WorkflowState, to: WorkflowState, context: PILContext) => {
      return store.validateTransition(from, to, context);
    },
    [store]
  );

  const canTransition = useCallback(
    (from: WorkflowState, to: WorkflowState, context: PILContext): boolean => {
      const result = store.validateTransition(from, to, context);
      return result.valid;
    },
    [store]
  );

  const evaluateGate = useCallback(
    (type: GateType, context: PILContext) => {
      return store.evaluateGate(type, context);
    },
    [store]
  );

  const getRecommendedGate = useCallback(
    (context: PILContext): GateType => {
      const riskScore = (context.risk_score as number) || 0;
      const confidence = (context.confidence as number) || 0;

      // Type Z: Critical risk - block
      if (riskScore > 0.9) return 'Type_Z';

      // Type C: High risk - escalate
      if (riskScore > 0.7) return 'Type_C';

      // Type A: High confidence - auto approve
      if (confidence >= 0.9) return 'Type_A';

      // Type B: Default - human confirm
      return 'Type_B';
    },
    []
  );

  const calculateTrustScore = useCallback(
    (context: PILContext) => {
      return store.calculateTrustScore(context);
    },
    [store]
  );

  const calculateProofDelta = useCallback(
    (expected: number, actual: number) => {
      return store.calculateProofDelta(expected, actual);
    },
    [store]
  );

  return {
    checkInvariant,
    checkAllInvariants,
    validateTransition,
    canTransition,
    evaluateGate,
    getRecommendedGate,
    calculateTrustScore,
    calculateProofDelta,
    lastValidation: store.lastValidation,
  };
}

// ============================================================================
// STANDALONE FUNCTIONS (Non-React Usage)
// ============================================================================

/**
 * Check all invariants without React hooks
 */
export function checkAllInvariantsStandalone(context: PILContext): AllInvariantsResult {
  const results: InvariantCheckResult[] = [];
  const failedInvariants: InvariantId[] = [];

  // I1: No Action Without Authority
  const i1Passed = !!context.authority_signature;
  results.push({
    invariantId: 'I1',
    passed: i1Passed,
    reason: i1Passed ? 'Authority signature present' : 'Missing authority signature',
  });
  if (!i1Passed) failedInvariants.push('I1');

  // I2: No Reality Without Proof
  const i2Passed = !!context.proof_hash;
  results.push({
    invariantId: 'I2',
    passed: i2Passed,
    reason: i2Passed ? 'Proof hash present' : 'Missing proof hash',
  });
  if (!i2Passed) failedInvariants.push('I2');

  // I3: No Trust Without Traceability
  const i3Passed = context.audit_trail === true;
  results.push({
    invariantId: 'I3',
    passed: i3Passed,
    reason: i3Passed ? 'Audit trail enabled' : 'Audit trail not enabled',
  });
  if (!i3Passed) failedInvariants.push('I3');

  // I4: No Economy Without Credits
  const balance = context.credit_balance ?? 0;
  const cost = context.execution_cost ?? 0;
  const i4Passed = balance >= cost;
  results.push({
    invariantId: 'I4',
    passed: i4Passed,
    reason: i4Passed
      ? `Sufficient credits: ${balance} >= ${cost}`
      : `Insufficient credits: ${balance} < ${cost}`,
  });
  if (!i4Passed) failedInvariants.push('I4');

  // I5: No Chaos Without Consequence
  const i5Passed = context.consequence_log === true;
  results.push({
    invariantId: 'I5',
    passed: i5Passed,
    reason: i5Passed ? 'Consequence logging enabled' : 'Consequence logging not enabled',
  });
  if (!i5Passed) failedInvariants.push('I5');

  // I6: No Claim Without Proof of Logic
  const i6Passed = context.proof_of_logic === true;
  results.push({
    invariantId: 'I6',
    passed: i6Passed,
    reason: i6Passed ? 'Proof of logic present' : 'Missing proof of logic',
  });
  if (!i6Passed) failedInvariants.push('I6');

  // I7: No Prediction Without Simulation Proof
  const i7Passed = context.simulation_proof === true;
  results.push({
    invariantId: 'I7',
    passed: i7Passed,
    reason: i7Passed ? 'Simulation proof present' : 'Missing simulation proof',
  });
  if (!i7Passed) failedInvariants.push('I7');

  const passed = failedInvariants.length === 0;
  const score = Math.round(((results.length - failedInvariants.length) / results.length) * 100);

  return {
    passed,
    score,
    total: results.length,
    results,
    failedInvariants,
  };
}

/**
 * Quick trust score calculation without React hooks
 */
export function quickTrustScore(
  proofDepth: number,
  verificationConfidence: number,
  simulationValidity: number
): number {
  const score =
    proofDepth * 0.4 +
    verificationConfidence * 0.35 +
    simulationValidity * 0.25;

  return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
}

/**
 * Quick proof delta calculation without React hooks
 */
export function quickProofDelta(expected: number, actual: number): number {
  return Math.abs(expected - actual);
}

/**
 * Determine gate type based on context
 */
export function determineGateType(context: PILContext): GateType {
  const riskScore = (context.risk_score as number) || 0;
  const confidence = (context.confidence as number) || 0;

  if (riskScore > 0.9) return 'Type_Z';
  if (riskScore > 0.7) return 'Type_C';
  if (confidence >= 0.9) return 'Type_A';
  return 'Type_B';
}

export default usePILConstraints;
