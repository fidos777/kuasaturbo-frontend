// ============================================================================
// PTE (PROOF-TIME EXECUTION) STATE STORE
// Sprint 4: PTE Module - Proof-Time Execution with audit trail
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// Invariant I5: "No Silence Without Signal" — Every interaction produces a trace
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MalaysianSector } from '@/types/qpi';
import {
  ExecutionContext,
  ExecutionPhase,
  ExecutionResult,
  PTEProof,
  PTEProofType,
  AuditEvent,
  AuditEventType,
  AuditTrail,
  PTEConfig,
  ExecutionMetrics,
  ErrorDetails,
  DEFAULT_PTE_CONFIG,
  generateContextId,
  generateProofId,
  generateAuditEventId,
  generatePTEHash,
  verifyProofChain,
  verifyAuditTrail,
  generateSampleExecutionContext,
  generateSampleProof,
} from '@/types/pte';

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface PTEStore {
  // Configuration
  config: PTEConfig;

  // Active executions
  activeContexts: Map<string, ExecutionContext>;
  executionPhases: Map<string, ExecutionPhase>;

  // Proof storage
  proofs: Map<string, PTEProof[]>;  // contextId -> proofs

  // Audit trails
  auditTrails: Map<string, AuditTrail>;

  // Completed executions
  completedResults: ExecutionResult[];

  // Statistics
  stats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalProofsGenerated: number;
    averageExecutionMs: number;
    totalCreditsConsumed: number;
  };

  // UI State
  selectedContextId: string | null;
  isLoading: boolean;
  lastError: string | null;

  // Actions - Configuration
  updateConfig: (config: Partial<PTEConfig>) => void;

  // Actions - Execution Lifecycle
  createContext: (workflowId: string, taskId: string, sector: MalaysianSector, inputs: Record<string, unknown>) => ExecutionContext;
  startExecution: (contextId: string) => Promise<void>;
  updatePhase: (contextId: string, phase: ExecutionPhase) => void;
  completeExecution: (contextId: string, output: unknown, success: boolean) => ExecutionResult;
  rollbackExecution: (contextId: string, reason: string) => void;

  // Actions - Proof Management
  generateProof: (contextId: string, type: PTEProofType, data?: Record<string, unknown>) => PTEProof;
  verifyProof: (proofId: string) => boolean;
  getProofChain: (contextId: string) => PTEProof[];
  validateProofChain: (contextId: string) => boolean;

  // Actions - Audit Trail
  addAuditEvent: (contextId: string, type: AuditEventType, details: Record<string, unknown>) => AuditEvent;
  getAuditTrail: (contextId: string) => AuditTrail | undefined;
  validateAuditTrail: (contextId: string) => boolean;

  // Actions - Query
  getContext: (contextId: string) => ExecutionContext | undefined;
  getActiveExecutions: () => ExecutionContext[];
  getCompletedResults: (limit?: number) => ExecutionResult[];
  getExecutionsByWorkflow: (workflowId: string) => ExecutionResult[];

  // Actions - UI
  selectContext: (contextId: string | null) => void;

  // Actions - Demo
  initializeDemo: () => void;
  simulateExecution: (workflowId: string, sector: MalaysianSector) => Promise<ExecutionResult>;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const usePTEStore = create<PTEStore>()(
  persist(
    (set, get) => ({
      // Initial state
      config: DEFAULT_PTE_CONFIG,
      activeContexts: new Map(),
      executionPhases: new Map(),
      proofs: new Map(),
      auditTrails: new Map(),
      completedResults: [],
      stats: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalProofsGenerated: 0,
        averageExecutionMs: 0,
        totalCreditsConsumed: 0,
      },
      selectedContextId: null,
      isLoading: false,
      lastError: null,

      // Configuration
      updateConfig: (partialConfig) => {
        set((state) => ({
          config: { ...state.config, ...partialConfig },
        }));
      },

      // Create execution context
      createContext: (workflowId, taskId, sector, inputs) => {
        const contextId = generateContextId();
        const now = new Date().toISOString();
        const inputHash = generatePTEHash(JSON.stringify(inputs));

        const context: ExecutionContext = {
          id: contextId,
          workflowId,
          taskId,
          tenantId: 'demo-tenant-001',
          sector,
          createdAt: now,
          inputHash,
          inputValidations: Object.entries(inputs).map(([field, value]) => ({
            field,
            value,
            constraint: 'validated',
            valid: true,
            validatedAt: now,
          })),
          allInputsValid: true,
          executorId: 'pte-executor-001',
          executorVersion: '1.0.0',
          environmentHash: generatePTEHash(`env-${Date.now()}`),
          creditsReserved: 50,
          creditsConsumed: 0,
          childContextIds: [],
        };

        // Initialize audit trail
        const auditTrail: AuditTrail = {
          contextId,
          workflowId,
          events: [],
          eventCount: 0,
          firstEventAt: now,
          lastEventAt: now,
          trailIntegrity: 'valid',
          proofIds: [],
        };

        set((state) => {
          const newContexts = new Map(state.activeContexts);
          newContexts.set(contextId, context);

          const newPhases = new Map(state.executionPhases);
          newPhases.set(contextId, 'initializing');

          const newProofs = new Map(state.proofs);
          newProofs.set(contextId, []);

          const newAuditTrails = new Map(state.auditTrails);
          newAuditTrails.set(contextId, auditTrail);

          return {
            activeContexts: newContexts,
            executionPhases: newPhases,
            proofs: newProofs,
            auditTrails: newAuditTrails,
          };
        });

        // Add audit event for context creation
        get().addAuditEvent(contextId, 'context_created', { workflowId, taskId, sector });

        return context;
      },

      // Start execution
      startExecution: async (contextId) => {
        const context = get().activeContexts.get(contextId);
        if (!context) {
          throw new Error(`Context not found: ${contextId}`);
        }

        set({ isLoading: true, lastError: null });

        try {
          // Update context with start time
          const now = new Date().toISOString();
          const updatedContext = { ...context, startedAt: now };

          set((state) => {
            const newContexts = new Map(state.activeContexts);
            newContexts.set(contextId, updatedContext);
            return { activeContexts: newContexts };
          });

          // Generate start proof
          get().generateProof(contextId, 'execution_start');

          // Add audit event
          get().addAuditEvent(contextId, 'execution_started', { startedAt: now });

          // Update phase
          get().updatePhase(contextId, 'executing');

        } catch (error) {
          set({
            isLoading: false,
            lastError: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }

        set({ isLoading: false });
      },

      // Update execution phase
      updatePhase: (contextId, phase) => {
        set((state) => {
          const newPhases = new Map(state.executionPhases);
          newPhases.set(contextId, phase);
          return { executionPhases: newPhases };
        });

        // Add checkpoint proof if enabled
        if (phase === 'verifying' && get().config.proofPolicy.checkpointEnabled) {
          get().generateProof(contextId, 'checkpoint');
        }
      },

      // Complete execution
      completeExecution: (contextId, output, success) => {
        const context = get().activeContexts.get(contextId);
        if (!context) {
          throw new Error(`Context not found: ${contextId}`);
        }

        const now = new Date().toISOString();
        const startedAt = context.startedAt || context.createdAt;
        const durationMs = new Date(now).getTime() - new Date(startedAt).getTime();

        // Generate appropriate proof
        const proofType: PTEProofType = success ? 'execution_complete' : 'execution_failed';
        const proof = get().generateProof(contextId, proofType, { output, success });

        // Calculate metrics
        const creditsUsed = Math.ceil(durationMs / 100) + 10; // Simple credit calculation
        const metrics: ExecutionMetrics = {
          durationMs,
          creditsUsed,
          tokensProcessed: Math.floor(Math.random() * 1000) + 100,
        };

        // Get all proofs for this context
        const proofs = get().proofs.get(contextId) || [];

        // Create result
        const result: ExecutionResult = {
          contextId,
          success,
          output,
          outputHash: generatePTEHash(JSON.stringify(output)),
          startedAt,
          completedAt: now,
          durationMs,
          proofs,
          proofChainValid: verifyProofChain(proofs),
          metrics,
          errors: success ? [] : [{
            code: 'EXECUTION_FAILED',
            message: 'Execution did not complete successfully',
            phase: get().executionPhases.get(contextId) || 'failed',
            recoverable: false,
            retryable: true,
          }],
          auditTrailId: contextId,
        };

        // Update state
        set((state) => {
          // Remove from active contexts
          const newContexts = new Map(state.activeContexts);
          newContexts.delete(contextId);

          const newPhases = new Map(state.executionPhases);
          newPhases.set(contextId, success ? 'completed' : 'failed');

          // Update stats
          const newStats = {
            ...state.stats,
            totalExecutions: state.stats.totalExecutions + 1,
            successfulExecutions: state.stats.successfulExecutions + (success ? 1 : 0),
            failedExecutions: state.stats.failedExecutions + (success ? 0 : 1),
            totalCreditsConsumed: state.stats.totalCreditsConsumed + creditsUsed,
            averageExecutionMs: Math.round(
              (state.stats.averageExecutionMs * state.stats.totalExecutions + durationMs) /
              (state.stats.totalExecutions + 1)
            ),
          };

          return {
            activeContexts: newContexts,
            executionPhases: newPhases,
            completedResults: [result, ...state.completedResults].slice(0, 100),
            stats: newStats,
          };
        });

        // Add final audit event
        get().addAuditEvent(contextId, 'execution_completed', { success, durationMs });

        return result;
      },

      // Rollback execution
      rollbackExecution: (contextId, reason) => {
        const context = get().activeContexts.get(contextId);
        if (!context) {
          throw new Error(`Context not found: ${contextId}`);
        }

        // Generate rollback proof
        get().generateProof(contextId, 'rollback', { reason });

        // Add audit event
        get().addAuditEvent(contextId, 'rollback_initiated', { reason });

        // Update phase
        get().updatePhase(contextId, 'rolled_back');

        // Remove from active
        set((state) => {
          const newContexts = new Map(state.activeContexts);
          newContexts.delete(contextId);
          return { activeContexts: newContexts };
        });
      },

      // Generate proof
      generateProof: (contextId, type, data = {}) => {
        const context = get().activeContexts.get(contextId);
        const existingProofs = get().proofs.get(contextId) || [];
        const lastProof = existingProofs[existingProofs.length - 1];
        const now = new Date().toISOString();

        const proof: PTEProof = {
          id: generateProofId(contextId, type),
          contextId,
          type,
          timing: type === 'execution_start' ? 'pre_execution' :
                  type === 'checkpoint' ? 'mid_execution' :
                  type === 'execution_failed' ? 'on_failure' :
                  type === 'rollback' ? 'on_rollback' : 'post_execution',
          phase: get().executionPhases.get(contextId) || 'initializing',
          proofHash: generatePTEHash(`${contextId}-${type}-${Date.now()}-${JSON.stringify(data)}`),
          previousProofHash: lastProof?.proofHash,
          generatedAt: now,
          data: {
            inputSnapshot: context?.inputHash,
            stateSnapshot: generatePTEHash(`state-${Date.now()}`),
            ...data,
          },
          verified: false,
          sequenceNumber: existingProofs.length,
          tags: [type, context?.sector || 'unknown'],
        };

        // Store proof
        set((state) => {
          const newProofs = new Map(state.proofs);
          const contextProofs = [...(newProofs.get(contextId) || []), proof];
          newProofs.set(contextId, contextProofs);

          // Update audit trail
          const newAuditTrails = new Map(state.auditTrails);
          const trail = newAuditTrails.get(contextId);
          if (trail) {
            trail.proofIds = [...trail.proofIds, proof.id];
            newAuditTrails.set(contextId, trail);
          }

          return {
            proofs: newProofs,
            auditTrails: newAuditTrails,
            stats: {
              ...state.stats,
              totalProofsGenerated: state.stats.totalProofsGenerated + 1,
            },
          };
        });

        // Add audit event
        get().addAuditEvent(contextId, 'proof_generated', { proofId: proof.id, type });

        return proof;
      },

      // Verify proof
      verifyProof: (proofId) => {
        let found = false;

        set((state) => {
          const newProofs = new Map(state.proofs);

          const entries = Array.from(newProofs.entries());
          for (const [contextId, proofs] of entries) {
            const proofIndex = proofs.findIndex((p: PTEProof) => p.id === proofId);
            if (proofIndex !== -1) {
              proofs[proofIndex] = {
                ...proofs[proofIndex],
                verified: true,
                verifiedAt: new Date().toISOString(),
                verifiedBy: 'pte-verifier-001',
              };
              newProofs.set(contextId, [...proofs]);
              found = true;

              // Add audit event
              get().addAuditEvent(contextId, 'proof_verified', { proofId });
              break;
            }
          }

          return { proofs: newProofs };
        });

        return found;
      },

      // Get proof chain
      getProofChain: (contextId) => {
        return get().proofs.get(contextId) || [];
      },

      // Validate proof chain
      validateProofChain: (contextId) => {
        const proofs = get().proofs.get(contextId) || [];
        return verifyProofChain(proofs);
      },

      // Add audit event
      addAuditEvent: (contextId, type, details) => {
        const trail = get().auditTrails.get(contextId);
        const lastEvent = trail?.events[trail.events.length - 1];
        const now = new Date().toISOString();

        const event: AuditEvent = {
          id: generateAuditEventId(contextId),
          contextId,
          type,
          timestamp: now,
          phase: get().executionPhases.get(contextId) || 'initializing',
          actor: 'pte-system',
          actorType: 'system',
          details,
          eventHash: generatePTEHash(`${contextId}-${type}-${Date.now()}-${JSON.stringify(details)}`),
          previousEventHash: lastEvent?.eventHash,
        };

        set((state) => {
          const newAuditTrails = new Map(state.auditTrails);
          const existingTrail = newAuditTrails.get(contextId);

          if (existingTrail) {
            const updatedTrail: AuditTrail = {
              ...existingTrail,
              events: [...existingTrail.events, event],
              eventCount: existingTrail.eventCount + 1,
              lastEventAt: now,
            };
            newAuditTrails.set(contextId, updatedTrail);
          }

          return { auditTrails: newAuditTrails };
        });

        return event;
      },

      // Get audit trail
      getAuditTrail: (contextId) => {
        return get().auditTrails.get(contextId);
      },

      // Validate audit trail
      validateAuditTrail: (contextId) => {
        const trail = get().auditTrails.get(contextId);
        if (!trail) return false;
        return verifyAuditTrail(trail.events);
      },

      // Get context
      getContext: (contextId) => {
        return get().activeContexts.get(contextId);
      },

      // Get active executions
      getActiveExecutions: () => {
        return Array.from(get().activeContexts.values());
      },

      // Get completed results
      getCompletedResults: (limit = 10) => {
        return get().completedResults.slice(0, limit);
      },

      // Get executions by workflow
      getExecutionsByWorkflow: (workflowId) => {
        return get().completedResults.filter((r) => {
          const trail = get().auditTrails.get(r.contextId);
          return trail?.workflowId === workflowId;
        });
      },

      // Select context for viewing
      selectContext: (contextId) => {
        set({ selectedContextId: contextId });
      },

      // Initialize demo data
      initializeDemo: () => {
        // Generate some sample completed executions
        const sectors: MalaysianSector[] = ['technology', 'finance', 'retail', 'healthcare'];
        const results: ExecutionResult[] = [];

        for (let i = 0; i < 10; i++) {
          const sector = sectors[i % sectors.length];
          const context = generateSampleExecutionContext(`wf-demo-${i}`, sector);
          const success = Math.random() > 0.2; // 80% success rate

          // Generate proofs
          const proofs: PTEProof[] = [];
          proofs.push(generateSampleProof(context, 'execution_start', 0));
          proofs.push(generateSampleProof(context, 'checkpoint', 1, proofs[0].proofHash));
          proofs.push(generateSampleProof(
            context,
            success ? 'execution_complete' : 'execution_failed',
            2,
            proofs[1].proofHash
          ));

          const durationMs = Math.floor(Math.random() * 5000) + 1000;
          const creditsUsed = Math.ceil(durationMs / 100) + 10;

          results.push({
            contextId: context.id,
            success,
            output: { result: `Demo output ${i}` },
            outputHash: generatePTEHash(`output-${i}`),
            startedAt: context.createdAt,
            completedAt: new Date().toISOString(),
            durationMs,
            proofs,
            proofChainValid: true,
            metrics: { durationMs, creditsUsed },
            errors: success ? [] : [{
              code: 'DEMO_ERROR',
              message: 'Simulated failure for demo',
              phase: 'executing',
              recoverable: false,
              retryable: true,
            }],
            auditTrailId: context.id,
          });
        }

        set({
          completedResults: results,
          stats: {
            totalExecutions: 10,
            successfulExecutions: results.filter((r) => r.success).length,
            failedExecutions: results.filter((r) => !r.success).length,
            totalProofsGenerated: results.reduce((sum, r) => sum + r.proofs.length, 0),
            averageExecutionMs: Math.round(
              results.reduce((sum, r) => sum + r.durationMs, 0) / results.length
            ),
            totalCreditsConsumed: results.reduce((sum, r) => sum + r.metrics.creditsUsed, 0),
          },
        });
      },

      // Simulate a full execution
      simulateExecution: async (workflowId, sector) => {
        const store = get();

        // Create context
        const context = store.createContext(workflowId, `task-sim-${Date.now()}`, sector, {
          query: 'Simulated execution query',
          maxTokens: 1000,
        });

        // Start execution
        await store.startExecution(context.id);

        // Simulate phases with delays
        await new Promise((resolve) => setTimeout(resolve, 500));
        store.updatePhase(context.id, 'validating');

        await new Promise((resolve) => setTimeout(resolve, 500));
        store.updatePhase(context.id, 'executing');

        await new Promise((resolve) => setTimeout(resolve, 1000));
        store.updatePhase(context.id, 'verifying');

        await new Promise((resolve) => setTimeout(resolve, 500));
        store.updatePhase(context.id, 'finalizing');

        // Complete with 90% success rate
        const success = Math.random() > 0.1;
        const result = store.completeExecution(
          context.id,
          { result: 'Simulated output', timestamp: new Date().toISOString() },
          success
        );

        return result;
      },
    }),
    {
      name: 'qontrek-pte-store',
      partialize: (state) => ({
        config: state.config,
        stats: state.stats,
        completedResults: state.completedResults.slice(0, 50),
      }),
    }
  )
);
