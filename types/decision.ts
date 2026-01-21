/**
 * Decision Accountability Types
 *
 * Sprint 6.5: Human accountability moment for governance decisions
 *
 * Purpose: "Menjadikan certification act of liability"
 *
 * This is NOT just UI — this is RITUAL.
 * It intentionally slows decisions to force risk awareness.
 */

// ============================================================================
// DECISION TYPES
// ============================================================================

export type DecisionType =
  | 'certify'      // Workflow certification
  | 'promote'      // Promote to production
  | 'reject'       // Reject workflow
  | 'override'     // Override gate decision
  | 'escalate'     // Escalate to higher authority
  | 'suspend'      // Suspend active workflow
  | 'reinstate';   // Reinstate suspended workflow

export type DecisionGateType = 'Type_A' | 'Type_B' | 'Type_C' | 'Type_Z';

export type DecisionStatus = 'pending' | 'signed' | 'revoked' | 'expired';

// ============================================================================
// DECISION JUSTIFICATION
// ============================================================================

export interface DecisionJustification {
  id: string;

  // What is being decided
  workflow_id: string;
  workflow_name: string;
  decision_type: DecisionType;
  gate_type: DecisionGateType;

  // Transition context
  from_state: string;
  to_state: string;

  // Trust metrics at decision time
  trust_score: number;
  credit_cost: number;
  proof_delta: number;

  // Human accountability (THE RITUAL)
  justification_text: string;       // Required, min 20 chars
  liability_accepted: boolean;      // Checkbox: "I accept liability"
  proof_reviewed: boolean;          // Checkbox: "I have reviewed proof chain"

  // Authority
  authority: {
    user_id: string;
    user_name: string;
    authority_level: number;        // 1-5
    role: string;
  };

  // Proof
  proof_hash: string;               // SHA-256 of decision content
  previous_hash?: string;           // Link to previous decision (chain)

  // Timestamps
  created_at: Date;
  signed_at?: Date;
  expires_at?: Date;

  // Status
  status: DecisionStatus;
  revocation_reason?: string;
}

// ============================================================================
// DECISION LOG ENTRY
// ============================================================================

export interface DecisionLogEntry {
  id: string;
  decision_id: string;

  // Summary view
  workflow_name: string;
  decision_type: DecisionType;
  gate_type: DecisionGateType;

  // Who & When
  authority_name: string;
  authority_level: number;
  signed_at: Date;

  // What they said
  justification_preview: string;    // First 100 chars

  // Proof
  proof_hash: string;

  // Outcome
  status: DecisionStatus;
  transition: string;               // e.g., "review → certified"
}

// ============================================================================
// DECISION CONTEXT (Input to Panel)
// ============================================================================

export interface DecisionContext {
  workflow_id: string;
  workflow_name: string;
  current_state: string;
  target_state: string;
  decision_type: DecisionType;
  gate_type: DecisionGateType;

  // Pre-computed metrics
  trust_score: number;
  credit_cost: number;
  proof_delta: number;

  // Proof chain summary
  proof_count: number;
  last_proof_hash: string;

  // Requirements
  min_authority_level: number;
  requires_justification: boolean;
  min_justification_length: number;
}

// ============================================================================
// DECISION RESULT
// ============================================================================

export interface DecisionResult {
  success: boolean;
  decision_id?: string;
  proof_hash?: string;
  error?: string;

  // What happened
  workflow_id: string;
  transition: string;
  authority: string;
  timestamp: Date;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface DecisionValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDecision(
  justification: Partial<DecisionJustification>,
  context: DecisionContext
): DecisionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!justification.justification_text) {
    errors.push('Justification text is required');
  } else if (justification.justification_text.length < context.min_justification_length) {
    errors.push(`Justification must be at least ${context.min_justification_length} characters`);
  }

  // Liability acceptance
  if (!justification.liability_accepted) {
    errors.push('You must accept liability for this decision');
  }

  // Proof review
  if (!justification.proof_reviewed) {
    errors.push('You must confirm you have reviewed the proof chain');
  }

  // Authority level
  if (justification.authority && justification.authority.authority_level < context.min_authority_level) {
    errors.push(`This decision requires authority level ${context.min_authority_level} or higher`);
  }

  // Warnings
  if (context.trust_score < 0.7) {
    warnings.push('Trust score is below recommended threshold (0.7)');
  }

  if (context.proof_delta > 0.1) {
    warnings.push('Proof delta exceeds normal threshold (0.1)');
  }

  if (context.gate_type === 'Type_Z') {
    warnings.push('This is a Type-Z (Disaster Prevention) decision - extra scrutiny recommended');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// HASH GENERATION
// ============================================================================

export function generateDecisionHash(decision: Partial<DecisionJustification>): string {
  const content = [
    decision.workflow_id,
    decision.decision_type,
    decision.justification_text,
    decision.authority?.user_id,
    decision.created_at?.toISOString(),
  ].join(':');

  // Simple hash for demo (in production, use crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `dec_${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

// ============================================================================
// STORE STATE
// ============================================================================

export interface DecisionStoreState {
  // Data
  decisions: DecisionJustification[];
  pendingDecision: Partial<DecisionJustification> | null;

  // UI State
  isSubmitting: boolean;
  error: string | null;
  showPanel: boolean;
  currentContext: DecisionContext | null;

  // Actions
  openDecisionPanel: (context: DecisionContext) => void;
  closeDecisionPanel: () => void;
  updatePendingDecision: (updates: Partial<DecisionJustification>) => void;
  submitDecision: () => Promise<DecisionResult>;
  revokeDecision: (decisionId: string, reason: string) => Promise<void>;
  getDecisionLog: (filter?: DecisionLogFilter) => DecisionLogEntry[];
  getDecisionById: (id: string) => DecisionJustification | null;
  reset: () => void;
}

export interface DecisionLogFilter {
  workflow_id?: string;
  decision_type?: DecisionType;
  gate_type?: DecisionGateType;
  authority_id?: string;
  from_date?: Date;
  to_date?: Date;
  status?: DecisionStatus;
  limit?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DECISION_TYPE_LABELS: Record<DecisionType, string> = {
  certify: 'Certify Workflow',
  promote: 'Promote to Production',
  reject: 'Reject Workflow',
  override: 'Override Gate Decision',
  escalate: 'Escalate to Higher Authority',
  suspend: 'Suspend Workflow',
  reinstate: 'Reinstate Workflow',
};

export const DECISION_TYPE_COLORS: Record<DecisionType, string> = {
  certify: '#10b981',   // Green
  promote: '#3b82f6',   // Blue
  reject: '#ef4444',    // Red
  override: '#f59e0b',  // Amber
  escalate: '#8b5cf6',  // Purple
  suspend: '#6b7280',   // Gray
  reinstate: '#06b6d4', // Cyan
};

export const GATE_TYPE_LABELS: Record<DecisionGateType, string> = {
  Type_A: 'Auto-Execute (Low Risk)',
  Type_B: 'Human Confirm (Medium Risk)',
  Type_C: 'Human Execute (High Risk)',
  Type_Z: 'Disaster Prevention (Critical)',
};

export const GATE_TYPE_COLORS: Record<DecisionGateType, string> = {
  Type_A: '#10b981',
  Type_B: '#f59e0b',
  Type_C: '#ef4444',
  Type_Z: '#1f2937',
};

export const MIN_JUSTIFICATION_LENGTH = 20;

export const AUTHORITY_LEVELS: Record<number, string> = {
  1: 'Operator',
  2: 'Supervisor',
  3: 'Manager',
  4: 'Director',
  5: 'Executive',
};
