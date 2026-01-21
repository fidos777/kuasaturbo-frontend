/**
 * useDecisionGate - Integration Hook
 *
 * Sprint 6.5: Human Accountability Layer
 *
 * Integrates Decision Justification into the governance flow.
 * For Type-B, Type-C, Type-Z decisions, this hook ensures
 * the Decision Justification Panel is shown before proceeding.
 *
 * Usage:
 *
 * const { requireDecision, executeWithDecision } = useDecisionGate();
 *
 * // Check if decision is required
 * const { required, context } = requireDecision(workflow, 'certify');
 *
 * // If required, open panel and wait for user
 * if (required) {
 *   openDecisionPanel(context);
 *   // Panel will call onComplete when user signs
 * }
 */

import { useCallback } from 'react';
import { useDecisionStore } from '../store/decisionStore';
import type {
  DecisionContext,
  DecisionType,
  DecisionGateType,
} from '../types/decision';

// ============================================================================
// TYPES
// ============================================================================

interface WorkflowForDecision {
  id: string;
  name: string;
  status: string;
  trust_score?: number;
  proof_count?: number;
  last_proof_hash?: string;
}

interface DecisionRequirement {
  required: boolean;
  gate_type: DecisionGateType;
  context?: DecisionContext;
  reason?: string;
}

interface UseDecisionGateReturn {
  // Check if decision is required
  requireDecision: (
    workflow: WorkflowForDecision,
    targetState: string,
    decisionType: DecisionType
  ) => DecisionRequirement;

  // Open the decision panel
  openDecisionPanel: (context: DecisionContext) => void;

  // Close the decision panel
  closeDecisionPanel: () => void;

  // Check if panel is open
  isPanelOpen: boolean;

  // Get current context
  currentContext: DecisionContext | null;

  // Execute with decision (combines check + panel)
  executeWithDecision: (
    workflow: WorkflowForDecision,
    targetState: string,
    decisionType: DecisionType,
    onDecisionRequired: (context: DecisionContext) => void,
    onAutoApproved: () => void
  ) => void;
}

// ============================================================================
// GATE DETERMINATION LOGIC
// ============================================================================

function determineGateType(
  workflow: WorkflowForDecision,
  targetState: string,
  decisionType: DecisionType
): DecisionGateType {
  const trustScore = workflow.trust_score || 0;

  // Type-Z: Critical decisions (promote, override, suspend)
  if (['promote', 'override', 'suspend'].includes(decisionType)) {
    return 'Type_Z';
  }

  // Type-Z: Very low trust
  if (trustScore < 0.3) {
    return 'Type_Z';
  }

  // Type-C: Low trust or reject decisions
  if (trustScore < 0.5 || decisionType === 'reject') {
    return 'Type_C';
  }

  // Type-B: Medium trust (requires human confirm)
  if (trustScore < 0.8) {
    return 'Type_B';
  }

  // Type-A: High trust (auto-execute)
  return 'Type_A';
}

function calculateCreditCost(
  workflow: WorkflowForDecision,
  targetState: string,
  gateType: DecisionGateType
): number {
  const baseCost = 10;
  const trustScore = workflow.trust_score || 0.5;

  // Multiplier based on target state
  const stateMultipliers: Record<string, number> = {
    tested: 2.0,
    review: 1.5,
    certified: 0.7,
    promoted: 0.5,
    rejected: 0,
    suspended: 0,
  };

  // Multiplier based on gate type
  const gateMultipliers: Record<DecisionGateType, number> = {
    Type_A: 1.0,
    Type_B: 1.2,
    Type_C: 1.5,
    Type_Z: 2.0,
  };

  // Trust discount
  const trustMultiplier = 1 + (1 - trustScore);

  const stateMultiplier = stateMultipliers[targetState] || 1.0;
  const gateMultiplier = gateMultipliers[gateType];

  return Math.round(baseCost * stateMultiplier * gateMultiplier * trustMultiplier);
}

function getMinAuthorityLevel(gateType: DecisionGateType): number {
  const levels: Record<DecisionGateType, number> = {
    Type_A: 1,
    Type_B: 2,
    Type_C: 3,
    Type_Z: 4,
  };
  return levels[gateType];
}

function getMinJustificationLength(gateType: DecisionGateType): number {
  const lengths: Record<DecisionGateType, number> = {
    Type_A: 0,
    Type_B: 20,
    Type_C: 50,
    Type_Z: 100,
  };
  return lengths[gateType];
}

// ============================================================================
// HOOK
// ============================================================================

export function useDecisionGate(): UseDecisionGateReturn {
  const {
    showPanel,
    currentContext,
    openDecisionPanel: storeOpenPanel,
    closeDecisionPanel: storeClosePanel,
  } = useDecisionStore();

  // Check if decision is required
  const requireDecision = useCallback((
    workflow: WorkflowForDecision,
    targetState: string,
    decisionType: DecisionType
  ): DecisionRequirement => {
    const gateType = determineGateType(workflow, targetState, decisionType);

    // Type-A: Auto-execute, no decision panel needed
    if (gateType === 'Type_A') {
      return {
        required: false,
        gate_type: gateType,
        reason: 'High trust score - auto-approved',
      };
    }

    // Type-B, C, Z: Decision panel required
    const context: DecisionContext = {
      workflow_id: workflow.id,
      workflow_name: workflow.name,
      current_state: workflow.status,
      target_state: targetState,
      decision_type: decisionType,
      gate_type: gateType,
      trust_score: workflow.trust_score || 0,
      credit_cost: calculateCreditCost(workflow, targetState, gateType),
      proof_delta: 0, // Would be calculated from actual proof chain
      proof_count: workflow.proof_count || 0,
      last_proof_hash: workflow.last_proof_hash || 'none',
      min_authority_level: getMinAuthorityLevel(gateType),
      requires_justification: true,
      min_justification_length: getMinJustificationLength(gateType),
    };

    return {
      required: true,
      gate_type: gateType,
      context,
      reason: `${gateType} requires human justification`,
    };
  }, []);

  // Open decision panel
  const openDecisionPanel = useCallback((context: DecisionContext) => {
    storeOpenPanel(context);
  }, [storeOpenPanel]);

  // Close decision panel
  const closeDecisionPanel = useCallback(() => {
    storeClosePanel();
  }, [storeClosePanel]);

  // Execute with decision (convenience method)
  const executeWithDecision = useCallback((
    workflow: WorkflowForDecision,
    targetState: string,
    decisionType: DecisionType,
    onDecisionRequired: (context: DecisionContext) => void,
    onAutoApproved: () => void
  ) => {
    const requirement = requireDecision(workflow, targetState, decisionType);

    if (requirement.required && requirement.context) {
      // Decision required - open panel
      openDecisionPanel(requirement.context);
      onDecisionRequired(requirement.context);
    } else {
      // Auto-approved - proceed
      onAutoApproved();
    }
  }, [requireDecision, openDecisionPanel]);

  return {
    requireDecision,
    openDecisionPanel,
    closeDecisionPanel,
    isPanelOpen: showPanel,
    currentContext,
    executeWithDecision,
  };
}

export default useDecisionGate;
