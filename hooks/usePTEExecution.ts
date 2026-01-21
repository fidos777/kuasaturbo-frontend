// ============================================================================
// PTE EXECUTION HOOK
// Sprint 4: PTE Module - Hook to integrate PTE with workflow execution
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// ============================================================================

import { useCallback, useState, useRef } from 'react';
import { usePTEStore } from '@/store/pteStore';
import { useCreditStore } from '@/store/creditStore';
import { MalaysianSector } from '@/types/qpi';
import { ExecutionContext, ExecutionResult, ExecutionPhase } from '@/types/pte';
import { CreditReservation } from '@/types/orchestrator';

interface PTEExecutionOptions {
  workflowId: string;
  taskId: string;
  sector: MalaysianSector;
  inputs: Record<string, unknown>;
  onPhaseChange?: (phase: ExecutionPhase) => void;
  onProofGenerated?: (proofId: string) => void;
  onComplete?: (result: ExecutionResult) => void;
  onError?: (error: Error) => void;
}

interface PTEExecutionState {
  isExecuting: boolean;
  currentPhase: ExecutionPhase | null;
  context: ExecutionContext | null;
  result: ExecutionResult | null;
  error: Error | null;
  proofCount: number;
}

export function usePTEExecution() {
  const [state, setState] = useState<PTEExecutionState>({
    isExecuting: false,
    currentPhase: null,
    context: null,
    result: null,
    error: null,
    proofCount: 0,
  });

  // Track current context for cleanup
  const contextRef = useRef<ExecutionContext | null>(null);

  // PTE Store actions
  const {
    createContext,
    startExecution,
    updatePhase,
    completeExecution,
    rollbackExecution,
    generateProof,
    getProofChain,
  } = usePTEStore();

  // Credit Store actions
  const { checkCredits, reserveCredits, consumeReservation, releaseReservation } = useCreditStore();

  /**
   * Execute a workflow with PTE (Proof-Time Execution)
   */
  const execute = useCallback(
    async (options: PTEExecutionOptions): Promise<ExecutionResult | null> => {
      const {
        workflowId,
        taskId,
        sector,
        inputs,
        onPhaseChange,
        onProofGenerated,
        onComplete,
        onError,
      } = options;

      setState((prev) => ({
        ...prev,
        isExecuting: true,
        currentPhase: 'initializing',
        error: null,
        result: null,
        proofCount: 0,
      }));

      let reservation: CreditReservation | null = null;

      try {
        // Phase 1: Initialize context
        onPhaseChange?.('initializing');
        const context = createContext(workflowId, taskId, sector, inputs);
        contextRef.current = context;
        setState((prev) => ({ ...prev, context, currentPhase: 'initializing' }));

        // Check and reserve credits
        const creditCheck = checkCredits(context.creditsReserved);
        if (!creditCheck.can_execute) {
          throw new Error(`Insufficient credits: ${creditCheck.shortfall || 0} more needed`);
        }

        reservation = reserveCredits(workflowId, taskId, context.creditsReserved);
        if (!reservation) {
          throw new Error('Failed to reserve credits');
        }

        // Phase 2: Validate inputs
        onPhaseChange?.('validating');
        setState((prev) => ({ ...prev, currentPhase: 'validating' }));
        updatePhase(context.id, 'validating');

        // Simulate validation delay
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (!context.allInputsValid) {
          throw new Error('Input validation failed');
        }

        // Phase 3: Start execution
        onPhaseChange?.('executing');
        setState((prev) => ({ ...prev, currentPhase: 'executing' }));
        await startExecution(context.id);

        // Track proof generation
        const trackProof = (proofId: string) => {
          setState((prev) => ({ ...prev, proofCount: prev.proofCount + 1 }));
          onProofGenerated?.(proofId);
        };

        // Start proof generated
        const startProofs = getProofChain(context.id);
        if (startProofs.length > 0) {
          trackProof(startProofs[startProofs.length - 1].id);
        }

        // Simulate execution work
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Phase 4: Verify outputs
        onPhaseChange?.('verifying');
        setState((prev) => ({ ...prev, currentPhase: 'verifying' }));
        updatePhase(context.id, 'verifying');

        // Checkpoint proof
        const checkpointProof = generateProof(context.id, 'checkpoint', {
          stage: 'verification',
        });
        trackProof(checkpointProof.id);

        await new Promise((resolve) => setTimeout(resolve, 300));

        // Phase 5: Finalize
        onPhaseChange?.('finalizing');
        setState((prev) => ({ ...prev, currentPhase: 'finalizing' }));
        updatePhase(context.id, 'finalizing');

        await new Promise((resolve) => setTimeout(resolve, 200));

        // Phase 6: Complete
        const output = {
          result: 'Execution completed successfully',
          timestamp: new Date().toISOString(),
          inputs,
        };

        const result = completeExecution(context.id, output, true);

        // Consume reserved credits
        const actualCredits = Math.min(result.metrics.creditsUsed, reservation.estimated_cost);
        consumeReservation(reservation.reservation_id, actualCredits);

        // Final state
        setState((prev) => ({
          ...prev,
          isExecuting: false,
          currentPhase: 'completed',
          result,
          proofCount: result.proofs.length,
        }));

        onComplete?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');

        // Release reservation if we got one
        if (reservation) {
          releaseReservation(reservation.reservation_id);
        }

        setState((prev) => ({
          ...prev,
          isExecuting: false,
          currentPhase: 'failed',
          error: err,
        }));

        // If we have a context, complete it as failed
        if (contextRef.current) {
          const failedResult = completeExecution(
            contextRef.current.id,
            { error: err.message },
            false
          );
          setState((prev) => ({ ...prev, result: failedResult }));
        }

        onError?.(err);
        return null;
      }
    },
    [
      createContext,
      startExecution,
      updatePhase,
      completeExecution,
      generateProof,
      getProofChain,
      checkCredits,
      reserveCredits,
      consumeReservation,
      releaseReservation,
    ]
  );

  /**
   * Rollback an active execution
   */
  const rollback = useCallback(
    (reason: string) => {
      if (!contextRef.current || !state.isExecuting) {
        return;
      }

      rollbackExecution(contextRef.current.id, reason);

      setState((prev) => ({
        ...prev,
        isExecuting: false,
        currentPhase: 'rolled_back',
      }));
    },
    [state.isExecuting, rollbackExecution]
  );

  /**
   * Reset execution state
   */
  const reset = useCallback(() => {
    contextRef.current = null;
    setState({
      isExecuting: false,
      currentPhase: null,
      context: null,
      result: null,
      error: null,
      proofCount: 0,
    });
  }, []);

  return {
    ...state,
    execute,
    rollback,
    reset,
  };
}
