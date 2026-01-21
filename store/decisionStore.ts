/**
 * Decision Store - Zustand State Management
 *
 * Sprint 6.5: Human Accountability Layer
 *
 * Manages:
 * - Decision justifications (the ritual)
 * - Decision log (audit trail)
 * - Hash chain integrity
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  DecisionStoreState,
  DecisionJustification,
  DecisionLogEntry,
  DecisionContext,
  DecisionResult,
  DecisionLogFilter,
  DecisionStatus,
} from '../types/decision';
import { validateDecision, generateDecisionHash } from '../types/decision';

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
  return `dec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function createLogEntry(decision: DecisionJustification): DecisionLogEntry {
  return {
    id: `log_${Date.now()}`,
    decision_id: decision.id,
    workflow_name: decision.workflow_name,
    decision_type: decision.decision_type,
    gate_type: decision.gate_type,
    authority_name: decision.authority.user_name,
    authority_level: decision.authority.authority_level,
    signed_at: decision.signed_at || new Date(),
    justification_preview: decision.justification_text.substring(0, 100) +
      (decision.justification_text.length > 100 ? '...' : ''),
    proof_hash: decision.proof_hash,
    status: decision.status,
    transition: `${decision.from_state} → ${decision.to_state}`,
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  decisions: [] as DecisionJustification[],
  pendingDecision: null as Partial<DecisionJustification> | null,
  isSubmitting: false,
  error: null as string | null,
  showPanel: false,
  currentContext: null as DecisionContext | null,
};

// ============================================================================
// STORE
// ============================================================================

export const useDecisionStore = create<DecisionStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // OPEN DECISION PANEL
        // ====================================================================
        openDecisionPanel: (context: DecisionContext) => {
          set({
            showPanel: true,
            currentContext: context,
            pendingDecision: {
              workflow_id: context.workflow_id,
              workflow_name: context.workflow_name,
              decision_type: context.decision_type,
              gate_type: context.gate_type,
              from_state: context.current_state,
              to_state: context.target_state,
              trust_score: context.trust_score,
              credit_cost: context.credit_cost,
              proof_delta: context.proof_delta,
              justification_text: '',
              liability_accepted: false,
              proof_reviewed: false,
              created_at: new Date(),
              status: 'pending' as DecisionStatus,
            },
            error: null,
          }, false, 'decision/openPanel');
        },

        // ====================================================================
        // CLOSE DECISION PANEL
        // ====================================================================
        closeDecisionPanel: () => {
          set({
            showPanel: false,
            currentContext: null,
            pendingDecision: null,
            error: null,
          }, false, 'decision/closePanel');
        },

        // ====================================================================
        // UPDATE PENDING DECISION
        // ====================================================================
        updatePendingDecision: (updates: Partial<DecisionJustification>) => {
          set((state) => ({
            pendingDecision: state.pendingDecision
              ? { ...state.pendingDecision, ...updates }
              : null,
          }), false, 'decision/updatePending');
        },

        // ====================================================================
        // SUBMIT DECISION (THE RITUAL)
        // ====================================================================
        submitDecision: async (): Promise<DecisionResult> => {
          const { pendingDecision, currentContext, decisions } = get();

          if (!pendingDecision || !currentContext) {
            return {
              success: false,
              error: 'No pending decision',
              workflow_id: '',
              transition: '',
              authority: '',
              timestamp: new Date(),
            };
          }

          // Validate
          const validation = validateDecision(pendingDecision, currentContext);
          if (!validation.valid) {
            set({ error: validation.errors.join('. ') }, false, 'decision/validationFailed');
            return {
              success: false,
              error: validation.errors.join('. '),
              workflow_id: pendingDecision.workflow_id || '',
              transition: `${pendingDecision.from_state} → ${pendingDecision.to_state}`,
              authority: pendingDecision.authority?.user_name || '',
              timestamp: new Date(),
            };
          }

          set({ isSubmitting: true, error: null }, false, 'decision/submitStart');

          try {
            // Generate proof hash (chain linked to previous)
            const previousHash = decisions.length > 0 ? decisions[0].proof_hash : undefined;
            const proof_hash = generateDecisionHash({
              ...pendingDecision,
              previous_hash: previousHash,
            });

            // Create final decision
            const decision: DecisionJustification = {
              id: generateId(),
              workflow_id: pendingDecision.workflow_id!,
              workflow_name: pendingDecision.workflow_name!,
              decision_type: pendingDecision.decision_type!,
              gate_type: pendingDecision.gate_type!,
              from_state: pendingDecision.from_state!,
              to_state: pendingDecision.to_state!,
              trust_score: pendingDecision.trust_score!,
              credit_cost: pendingDecision.credit_cost!,
              proof_delta: pendingDecision.proof_delta!,
              justification_text: pendingDecision.justification_text!,
              liability_accepted: pendingDecision.liability_accepted!,
              proof_reviewed: pendingDecision.proof_reviewed!,
              authority: pendingDecision.authority!,
              proof_hash,
              previous_hash: previousHash,
              created_at: pendingDecision.created_at!,
              signed_at: new Date(),
              status: 'signed',
            };

            // Add to store (newest first)
            set((state) => ({
              decisions: [decision, ...state.decisions].slice(0, 500), // Keep max 500
              pendingDecision: null,
              currentContext: null,
              showPanel: false,
              isSubmitting: false,
            }), false, 'decision/submitSuccess');

            return {
              success: true,
              decision_id: decision.id,
              proof_hash: decision.proof_hash,
              workflow_id: decision.workflow_id,
              transition: `${decision.from_state} → ${decision.to_state}`,
              authority: decision.authority.user_name,
              timestamp: decision.signed_at!,
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            set({ isSubmitting: false, error: errorMessage }, false, 'decision/submitError');
            return {
              success: false,
              error: errorMessage,
              workflow_id: pendingDecision.workflow_id || '',
              transition: '',
              authority: '',
              timestamp: new Date(),
            };
          }
        },

        // ====================================================================
        // REVOKE DECISION
        // ====================================================================
        revokeDecision: async (decisionId: string, reason: string): Promise<void> => {
          set((state) => ({
            decisions: state.decisions.map((d) =>
              d.id === decisionId
                ? { ...d, status: 'revoked' as DecisionStatus, revocation_reason: reason }
                : d
            ),
          }), false, 'decision/revoke');
        },

        // ====================================================================
        // GET DECISION LOG
        // ====================================================================
        getDecisionLog: (filter?: DecisionLogFilter): DecisionLogEntry[] => {
          const { decisions } = get();

          let filtered = decisions;

          if (filter) {
            if (filter.workflow_id) {
              filtered = filtered.filter((d) => d.workflow_id === filter.workflow_id);
            }
            if (filter.decision_type) {
              filtered = filtered.filter((d) => d.decision_type === filter.decision_type);
            }
            if (filter.gate_type) {
              filtered = filtered.filter((d) => d.gate_type === filter.gate_type);
            }
            if (filter.authority_id) {
              filtered = filtered.filter((d) => d.authority.user_id === filter.authority_id);
            }
            if (filter.status) {
              filtered = filtered.filter((d) => d.status === filter.status);
            }
            if (filter.from_date) {
              filtered = filtered.filter((d) => d.signed_at && d.signed_at >= filter.from_date!);
            }
            if (filter.to_date) {
              filtered = filtered.filter((d) => d.signed_at && d.signed_at <= filter.to_date!);
            }
          }

          const limit = filter?.limit || 100;
          return filtered.slice(0, limit).map(createLogEntry);
        },

        // ====================================================================
        // GET DECISION BY ID
        // ====================================================================
        getDecisionById: (id: string): DecisionJustification | null => {
          return get().decisions.find((d) => d.id === id) || null;
        },

        // ====================================================================
        // RESET
        // ====================================================================
        reset: () => {
          set(initialState, false, 'decision/reset');
        },
      }),
      {
        name: 'qontrek-decision-store',
        partialize: (state) => ({
          decisions: state.decisions.slice(0, 100), // Persist max 100
        }),
      }
    ),
    { name: 'DecisionStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectDecisions = (state: DecisionStoreState) => state.decisions;
export const selectPendingDecision = (state: DecisionStoreState) => state.pendingDecision;
export const selectShowPanel = (state: DecisionStoreState) => state.showPanel;
export const selectCurrentContext = (state: DecisionStoreState) => state.currentContext;
export const selectIsSubmitting = (state: DecisionStoreState) => state.isSubmitting;
export const selectError = (state: DecisionStoreState) => state.error;

export default useDecisionStore;
