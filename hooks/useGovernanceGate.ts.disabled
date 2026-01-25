/**
 * Unified Governance Gate Hook
 *
 * Sprint 6: Verification Studio
 *
 * This hook unifies PIL (pre-execution validation) and PTE (execution tracking)
 * into a single entry point for workflow execution governance.
 *
 * PIL = "Can this action proceed?" (validation)
 * PTE = "What happened and when?" (audit trail)
 *
 * Philosophy: "Math makes AI trustworthy"
 */

import { useCallback, useState, useRef } from 'react';
import { usePILStore } from '../store/pilStore';
import { usePTEStore } from '../store/pteStore';
import { useCreditStore } from '../store/creditStore';
import type {
  PILContext,
  InvariantId,
  AllInvariantsResult,
  GateType,
  EnforcementMode,
  WorkflowState,
  TransitionValidationResult,
} from '../types/pil';
import type { PTEProofType, AuditEventType } from '../types/pte';
import type { MalaysianSector } from '../types/qpi';

// ============================================================================
// TYPES
// ============================================================================

export type GovernanceActor = 'human' | 'agent' | 'system' | 'external';

export interface GovernanceContext extends PILContext {
  // Workflow identification
  workflow_id: string;
  task_id: string;
  sector?: MalaysianSector;

  // Actor information
  actor_type: GovernanceActor;
  actor_id: string;

  // Workflow state
  current_state?: WorkflowState;
  target_state?: WorkflowState;
}

export interface GovernanceDecision {
  // Overall decision
  allowed: boolean;
  reason: string;

  // Gate result
  gate: GateType;
  gateAction: string;

  // Invariant results
  invariantsResult: AllInvariantsResult;

  // Transition result (if applicable)
  transitionResult?: TransitionValidationResult;

  // Computed metrics
  trustScore: number;
  proofDelta: number;

  // Enforcement
  enforcementMode: EnforcementMode;
  blockedBy: InvariantId[];
  warnedBy: InvariantId[];

  // Audit
  decisionId: string;
  timestamp: Date;
}

export interface ExecutionHandle {
  contextId: string;
  startTime: Date;
  context: GovernanceContext;
  decision: GovernanceDecision;
}

export interface GovernanceGateState {
  isProcessing: boolean;
  lastDecision: GovernanceDecision | null;
  activeExecution: ExecutionHandle | null;
  error: Error | null;
}

export interface UseGovernanceGateReturn extends GovernanceGateState {
  // Pre-execution validation (PIL)
  validate: (context: GovernanceContext) => Promise<GovernanceDecision>;

  // Start tracked execution (PTE)
  startExecution: (context: GovernanceContext) => Promise<ExecutionHandle | null>;

  // Record event during execution
  recordEvent: (
    handle: ExecutionHandle,
    eventType: AuditEventType,
    details: Record<string, unknown>
  ) => void;

  // Complete execution
  completeExecution: (
    handle: ExecutionHandle,
    success: boolean,
    output?: Record<string, unknown>
  ) => void;

  // Abort execution
  abortExecution: (handle: ExecutionHandle, reason: string) => void;

  // Quick checks
  canProceed: (context: GovernanceContext) => boolean;
  getRecommendedGate: (context: GovernanceContext) => GateType;

  // Reset state
  reset: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useGovernanceGate(): UseGovernanceGateReturn {
  const [state, setState] = useState<GovernanceGateState>({
    isProcessing: false,
    lastDecision: null,
    activeExecution: null,
    error: null,
  });

  const executionRef = useRef<ExecutionHandle | null>(null);

  // Store hooks
  const pilStore = usePILStore();
  const pteStore = usePTEStore();
  const creditStore = useCreditStore();

  /**
   * Generate unique ID
   */
  const generateId = useCallback((prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Validate context against PIL constraints
   */
  const validate = useCallback(
    async (context: GovernanceContext): Promise<GovernanceDecision> => {
      setState((prev) => ({ ...prev, isProcessing: true, error: null }));

      try {
        // 1. Check all invariants
        const invariantsResult = pilStore.checkAllInvariants(context);

        // 2. Determine gate type and evaluate
        const gateType = determineGateType(context);
        const gateResult = pilStore.evaluateGate(gateType, context);

        // 3. Validate transition if states are provided
        let transitionResult: TransitionValidationResult | undefined;
        if (context.current_state && context.target_state) {
          transitionResult = pilStore.validateTransition(
            context.current_state,
            context.target_state,
            context
          );
        }

        // 4. Calculate metrics
        const trustScore = pilStore.calculateTrustScore(context);
        const proofDelta = pilStore.calculateProofDelta(
          1.0,
          (context.simulation_validity as number) || 0
        );

        // 5. Determine blocked/warned invariants based on enforcement mode
        const blockedBy: InvariantId[] = [];
        const warnedBy: InvariantId[] = [];

        for (const result of invariantsResult.results) {
          if (!result.passed) {
            const invariant = pilStore.invariants[result.invariantId];
            if (invariant.enforcementMode === 'block') {
              blockedBy.push(result.invariantId);
            } else if (invariant.enforcementMode === 'warn') {
              warnedBy.push(result.invariantId);
            }
          }
        }

        // 6. Determine overall decision
        const transitionBlocked = transitionResult && !transitionResult.valid;
        const gateBlocked = gateResult.action === 'block';
        const invariantsBlocked = blockedBy.length > 0;

        const allowed =
          !invariantsBlocked && !gateBlocked && !transitionBlocked;

        // 7. Determine enforcement mode
        let enforcementMode: EnforcementMode = 'log';
        if (invariantsBlocked || gateBlocked) {
          enforcementMode = 'block';
        } else if (warnedBy.length > 0) {
          enforcementMode = 'warn';
        }

        // 8. Generate reason
        let reason = 'All checks passed';
        if (!allowed) {
          const reasons: string[] = [];
          if (invariantsBlocked) {
            reasons.push(`Invariants blocked: ${blockedBy.join(', ')}`);
          }
          if (gateBlocked) {
            reasons.push(`Gate blocked: ${gateType}`);
          }
          if (transitionBlocked) {
            reasons.push(
              `Transition blocked: ${context.current_state} -> ${context.target_state}`
            );
          }
          reason = reasons.join('; ');
        } else if (warnedBy.length > 0) {
          reason = `Allowed with warnings: ${warnedBy.join(', ')}`;
        }

        // 9. Create decision record
        const decision: GovernanceDecision = {
          allowed,
          reason,
          gate: gateType,
          gateAction: gateResult.action,
          invariantsResult,
          transitionResult,
          trustScore,
          proofDelta,
          enforcementMode,
          blockedBy,
          warnedBy,
          decisionId: generateId('gov'),
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          lastDecision: decision,
        }));

        return decision;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Validation failed');
        setState((prev) => ({ ...prev, isProcessing: false, error: err }));
        throw err;
      }
    },
    [pilStore, generateId]
  );

  /**
   * Start a tracked execution
   */
  const startExecution = useCallback(
    async (context: GovernanceContext): Promise<ExecutionHandle | null> => {
      setState((prev) => ({ ...prev, isProcessing: true, error: null }));

      try {
        // 1. Validate first
        const decision = await validate(context);

        // 2. Check if allowed
        if (!decision.allowed) {
          setState((prev) => ({ ...prev, isProcessing: false }));
          return null;
        }

        // 3. Check credits
        const creditCheck = creditStore.checkCredits(
          (context.execution_cost as number) || 0
        );
        if (!creditCheck.can_execute) {
          throw new Error(
            `Insufficient credits: ${creditCheck.shortfall || 0} more needed`
          );
        }

        // 4. Reserve credits
        const reservation = creditStore.reserveCredits(
          context.workflow_id,
          context.task_id,
          (context.execution_cost as number) || 0
        );

        if (!reservation) {
          throw new Error('Failed to reserve credits');
        }

        // 5. Create PTE execution context
        const sector = context.sector || 'technology';
        const pteContext = pteStore.createContext(
          context.workflow_id,
          context.task_id,
          sector,
          { governanceDecision: decision.decisionId }
        );

        // 6. Create execution handle
        const handle: ExecutionHandle = {
          contextId: pteContext.id,
          startTime: new Date(),
          context,
          decision,
        };

        executionRef.current = handle;

        // 7. Add audit event
        pteStore.addAuditEvent(pteContext.id, 'context_created', {
          governance_decision: decision.decisionId,
          trust_score: decision.trustScore,
        });

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          activeExecution: handle,
        }));

        return handle;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Start execution failed');
        setState((prev) => ({ ...prev, isProcessing: false, error: err }));
        throw err;
      }
    },
    [validate, creditStore, pteStore]
  );

  /**
   * Record event during execution
   */
  const recordEvent = useCallback(
    (
      handle: ExecutionHandle,
      eventType: AuditEventType,
      details: Record<string, unknown>
    ): void => {
      pteStore.addAuditEvent(handle.contextId, eventType, details);
    },
    [pteStore]
  );

  /**
   * Complete execution
   */
  const completeExecution = useCallback(
    (
      handle: ExecutionHandle,
      success: boolean,
      output?: Record<string, unknown>
    ): void => {
      pteStore.completeExecution(handle.contextId, output || {}, success);

      // Reset state
      executionRef.current = null;
      setState((prev) => ({ ...prev, activeExecution: null }));
    },
    [pteStore]
  );

  /**
   * Abort execution
   */
  const abortExecution = useCallback(
    (handle: ExecutionHandle, reason: string): void => {
      pteStore.rollbackExecution(handle.contextId, reason);

      // Reset state
      executionRef.current = null;
      setState((prev) => ({ ...prev, activeExecution: null }));
    },
    [pteStore]
  );

  /**
   * Quick check if execution can proceed
   */
  const canProceed = useCallback(
    (context: GovernanceContext): boolean => {
      const invariantsResult = pilStore.checkAllInvariants(context);
      const gateType = determineGateType(context);
      const gateResult = pilStore.evaluateGate(gateType, context);

      // Check if any blocking invariants failed
      for (const result of invariantsResult.results) {
        if (!result.passed) {
          const invariant = pilStore.invariants[result.invariantId];
          if (invariant.enforcementMode === 'block') {
            return false;
          }
        }
      }

      // Check if gate blocked
      if (gateResult.action === 'block') {
        return false;
      }

      return true;
    },
    [pilStore]
  );

  /**
   * Get recommended gate type
   */
  const getRecommendedGate = useCallback(
    (context: GovernanceContext): GateType => {
      return determineGateType(context);
    },
    []
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    executionRef.current = null;
    setState({
      isProcessing: false,
      lastDecision: null,
      activeExecution: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    validate,
    startExecution,
    recordEvent,
    completeExecution,
    abortExecution,
    canProceed,
    getRecommendedGate,
    reset,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function determineGateType(context: GovernanceContext): GateType {
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
}

// ============================================================================
// STANDALONE FUNCTIONS
// ============================================================================

/**
 * Quick governance check without React hooks
 */
export function quickGovernanceCheck(context: GovernanceContext): {
  allowed: boolean;
  gate: GateType;
  reason: string;
} {
  const gate = determineGateType(context);

  // Check critical invariants
  if (!context.authority_signature) {
    return { allowed: false, gate, reason: 'Missing authority signature (I1)' };
  }
  if (!context.proof_hash) {
    return { allowed: false, gate, reason: 'Missing proof hash (I2)' };
  }
  if (!context.audit_trail) {
    return { allowed: false, gate, reason: 'Audit trail not enabled (I3)' };
  }

  const balance = context.credit_balance ?? 0;
  const cost = context.execution_cost ?? 0;
  if (balance < cost) {
    return { allowed: false, gate, reason: `Insufficient credits: ${balance} < ${cost} (I4)` };
  }

  // Check gate
  if (gate === 'Type_Z') {
    return { allowed: false, gate, reason: 'Risk score too high - blocked by Type_Z gate' };
  }

  return { allowed: true, gate, reason: 'All governance checks passed' };
}

export default useGovernanceGate;
