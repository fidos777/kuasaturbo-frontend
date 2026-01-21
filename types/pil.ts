/**
 * PIL (Prompt Invariant Language) Types
 *
 * Type definitions for the PIL constraint language system.
 * Part of Sprint 5: PIL Framework
 *
 * Philosophy: "Math makes AI trustworthy"
 * Purpose: Express governance constraints in a verifiable, executable syntax.
 */

// ============================================================================
// INVARIANT TYPES
// ============================================================================

export type InvariantId = 'I1' | 'I2' | 'I3' | 'I4' | 'I5' | 'I6' | 'I7';

export type InvariantCategory =
  | 'authority'
  | 'proof'
  | 'traceability'
  | 'economy'
  | 'consequence'
  | 'logic'
  | 'simulation';

export type InvariantSeverity = 'critical' | 'high' | 'medium' | 'low';

export type EnforcementMode = 'block' | 'warn' | 'log';

export interface Invariant {
  id: InvariantId;
  name: string;
  expression: string;
  description: string;
  category: InvariantCategory;
  severity: InvariantSeverity;
  requirement: string;
  enabled: boolean;
  enforcementMode: EnforcementMode;
}

// The 7 Constitutional Invariants
export const THE_SEVEN_INVARIANTS: Record<InvariantId, Invariant> = {
  I1: {
    id: 'I1',
    name: 'No Action Without Authority',
    expression: 'REQUIRE authority_signature FOR action',
    description: 'Every action must have a valid authority signature',
    category: 'authority',
    severity: 'critical',
    requirement: 'authority_signature',
    enabled: true,
    enforcementMode: 'block',
  },
  I2: {
    id: 'I2',
    name: 'No Reality Without Proof',
    expression: 'REQUIRE proof_hash FOR state_transition',
    description: 'Every state transition must have cryptographic proof',
    category: 'proof',
    severity: 'critical',
    requirement: 'proof_hash',
    enabled: true,
    enforcementMode: 'block',
  },
  I3: {
    id: 'I3',
    name: 'No Trust Without Traceability',
    expression: 'REQUIRE audit_trail FOR decision',
    description: 'Every decision must have an auditable trail',
    category: 'traceability',
    severity: 'high',
    requirement: 'audit_trail',
    enabled: true,
    enforcementMode: 'block',
  },
  I4: {
    id: 'I4',
    name: 'No Economy Without Credits',
    expression: 'REQUIRE credit_balance >= cost FOR execution',
    description: 'Execution requires sufficient credit balance',
    category: 'economy',
    severity: 'high',
    requirement: 'credit_balance',
    enabled: true,
    enforcementMode: 'block',
  },
  I5: {
    id: 'I5',
    name: 'No Chaos Without Consequence',
    expression: 'REQUIRE consequence_log FOR violation',
    description: 'All violations must be logged with consequences',
    category: 'consequence',
    severity: 'medium',
    requirement: 'consequence_log',
    enabled: true,
    enforcementMode: 'warn',
  },
  I6: {
    id: 'I6',
    name: 'No Claim Without Proof of Logic',
    expression: 'REQUIRE proof_of_logic FOR claim',
    description: 'All claims must be backed by logical proof',
    category: 'logic',
    severity: 'high',
    requirement: 'proof_of_logic',
    enabled: true,
    enforcementMode: 'block',
  },
  I7: {
    id: 'I7',
    name: 'No Prediction Without Simulation Proof',
    expression: 'REQUIRE simulation_proof FOR prediction',
    description: 'Predictions must be validated by simulation',
    category: 'simulation',
    severity: 'medium',
    requirement: 'simulation_proof',
    enabled: true,
    enforcementMode: 'warn',
  },
};

// ============================================================================
// STATE TRANSITION TYPES
// ============================================================================

export type WorkflowState =
  | 'draft'
  | 'tested'
  | 'certified'
  | 'promoted'
  | 'deprecated'
  | 'archived';

export interface StateTransition {
  id: string;
  from: WorkflowState;
  to: WorkflowState;
  requirements: TransitionRequirement[];
  expression: string;
}

export interface TransitionRequirement {
  field: string;
  operator: PILOperator;
  value: unknown;
}

// Valid state transitions
export const VALID_TRANSITIONS: StateTransition[] = [
  {
    id: 'draft_to_tested',
    from: 'draft',
    to: 'tested',
    requirements: [
      { field: 'test_coverage', operator: '>=', value: 0.8 },
    ],
    expression: 'TRANSITION draft -> tested REQUIRES test_coverage >= 0.8',
  },
  {
    id: 'tested_to_certified',
    from: 'tested',
    to: 'certified',
    requirements: [
      { field: 'human_approval', operator: '=', value: true },
    ],
    expression: 'TRANSITION tested -> certified REQUIRES human_approval = TRUE',
  },
  {
    id: 'certified_to_promoted',
    from: 'certified',
    to: 'promoted',
    requirements: [
      { field: 'simulation_valid', operator: '=', value: true },
    ],
    expression: 'TRANSITION certified -> promoted REQUIRES simulation_valid = TRUE',
  },
  {
    id: 'promoted_to_deprecated',
    from: 'promoted',
    to: 'deprecated',
    requirements: [
      { field: 'deprecation_approved', operator: '=', value: true },
    ],
    expression: 'TRANSITION promoted -> deprecated REQUIRES deprecation_approved = TRUE',
  },
  {
    id: 'deprecated_to_archived',
    from: 'deprecated',
    to: 'archived',
    requirements: [
      { field: 'archive_approved', operator: '=', value: true },
    ],
    expression: 'TRANSITION deprecated -> archived REQUIRES archive_approved = TRUE',
  },
  // Rollback transitions
  {
    id: 'promoted_to_certified',
    from: 'promoted',
    to: 'certified',
    requirements: [
      { field: 'rollback_reason', operator: '!=', value: null },
    ],
    expression: 'TRANSITION promoted -> certified REQUIRES rollback_reason != NULL',
  },
  {
    id: 'certified_to_tested',
    from: 'certified',
    to: 'tested',
    requirements: [
      { field: 'rollback_reason', operator: '!=', value: null },
    ],
    expression: 'TRANSITION certified -> tested REQUIRES rollback_reason != NULL',
  },
  {
    id: 'tested_to_draft',
    from: 'tested',
    to: 'draft',
    requirements: [
      { field: 'rollback_reason', operator: '!=', value: null },
    ],
    expression: 'TRANSITION tested -> draft REQUIRES rollback_reason != NULL',
  },
];

// ============================================================================
// GATE TYPES (Bayesian Logic)
// ============================================================================

export type GateType = 'Type_A' | 'Type_B' | 'Type_C' | 'Type_Z';

export type GateAction =
  | 'auto_approve'
  | 'require_human_confirm'
  | 'escalate_E2'
  | 'block';

export interface Gate {
  id: string;
  type: GateType;
  condition: GateCondition;
  action: GateAction;
  expression: string;
  description: string;
}

export interface GateCondition {
  field: string;
  operator: PILOperator;
  threshold: number;
}

export const GATES: Gate[] = [
  {
    id: 'gate_type_a',
    type: 'Type_A',
    condition: { field: 'confidence', operator: '>=', threshold: 0.9 },
    action: 'auto_approve',
    expression: 'GATE Type_A WHEN confidence >= 0.9 THEN auto_approve',
    description: 'High confidence actions auto-approve',
  },
  {
    id: 'gate_type_b',
    type: 'Type_B',
    condition: { field: 'confidence', operator: '<', threshold: 0.9 },
    action: 'require_human_confirm',
    expression: 'GATE Type_B WHEN confidence < 0.9 THEN REQUIRE human_confirm',
    description: 'Medium confidence requires human confirmation',
  },
  {
    id: 'gate_type_c',
    type: 'Type_C',
    condition: { field: 'risk_score', operator: '>', threshold: 0.7 },
    action: 'escalate_E2',
    expression: 'GATE Type_C WHEN risk_score > 0.7 THEN escalate_E2',
    description: 'High risk escalates to E2 review',
  },
  {
    id: 'gate_type_z',
    type: 'Type_Z',
    condition: { field: 'risk_score', operator: '>', threshold: 0.9 },
    action: 'block',
    expression: 'GATE Type_Z WHEN risk_score > 0.9 THEN block',
    description: 'Critical risk blocks execution',
  },
];

// ============================================================================
// METRIC & FORMULA TYPES
// ============================================================================

export interface PILMetric {
  id: string;
  name: string;
  formula: string;
  expression: string;
  description: string;
}

export interface PILConstraint {
  id: string;
  metric: string;
  operator: PILOperator;
  threshold: number;
  scope: string;
  expression: string;
}

export interface PILFormula {
  id: string;
  name: string;
  components: FormulaComponent[];
  expression: string;
  description: string;
}

export interface FormulaComponent {
  field: string;
  weight: number;
}

// Standard metrics
export const PIL_METRICS: PILMetric[] = [
  {
    id: 'proof_delta',
    name: 'Proof Delta',
    formula: 'ABS(expected_state - actual_state)',
    expression: 'METRIC proof_delta = ABS(expected_state - actual_state)',
    description: 'Difference between expected and actual state',
  },
];

// Standard constraints
export const PIL_CONSTRAINTS: PILConstraint[] = [
  {
    id: 'proof_delta_type_a',
    metric: 'proof_delta',
    operator: '<=',
    threshold: 0.1,
    scope: 'Type_A_workflow',
    expression: 'CONSTRAINT proof_delta <= 0.1 FOR Type_A_workflow',
  },
  {
    id: 'proof_delta_type_z',
    metric: 'proof_delta',
    operator: '<=',
    threshold: 0.05,
    scope: 'Type_Z_workflow',
    expression: 'CONSTRAINT proof_delta <= 0.05 FOR Type_Z_workflow',
  },
];

// Trust score formula
export const TRUST_SCORE_FORMULA: PILFormula = {
  id: 'trust_score',
  name: 'Trust Score',
  components: [
    { field: 'proof_depth', weight: 0.4 },
    { field: 'verification_confidence', weight: 0.35 },
    { field: 'simulation_validity', weight: 0.25 },
  ],
  expression: 'FORMULA trust_score = (proof_depth * 0.4) + (verification_confidence * 0.35) + (simulation_validity * 0.25)',
  description: 'Composite trust score for promotion decisions',
};

// ============================================================================
// PIL SYNTAX TYPES
// ============================================================================

export type PILKeyword =
  | 'INVARIANT'
  | 'CONSTRAINT'
  | 'TRANSITION'
  | 'GATE'
  | 'METRIC'
  | 'FORMULA'
  | 'REQUIRE'
  | 'WHEN'
  | 'THEN'
  | 'FOR';

export type PILOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'AND' | 'OR' | 'NOT' | '->';

export interface PILStatement {
  id: string;
  type: PILKeyword;
  raw: string;
  parsed: ParsedStatement;
  valid: boolean;
  errors: string[];
  lineNumber?: number;
}

export interface ParsedStatement {
  keyword: PILKeyword;
  identifier?: string;
  condition?: ParsedCondition;
  action?: string;
  scope?: string;
  requirements?: TransitionRequirement[];
}

export interface ParsedCondition {
  left: string;
  operator: PILOperator;
  right: string | number | boolean;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface InvariantCheckResult {
  invariantId: InvariantId;
  passed: boolean;
  reason?: string;
  value?: unknown;
  required?: unknown;
}

export interface AllInvariantsResult {
  passed: boolean;
  score: number;
  total: number;
  results: InvariantCheckResult[];
  failedInvariants: InvariantId[];
}

export interface TransitionValidationResult {
  valid: boolean;
  from: WorkflowState;
  to: WorkflowState;
  errors: string[];
  missingRequirements: string[];
}

export interface GateEvaluationResult {
  gate: GateType;
  triggered: boolean;
  action: GateAction;
  reason: string;
  confidence?: number;
  riskScore?: number;
}

// ============================================================================
// EXECUTION CONTEXT
// ============================================================================

export interface PILContext {
  // Authority
  authority_signature?: string;

  // Proof
  proof_hash?: string;
  proof_depth?: number;

  // Traceability
  audit_trail?: boolean;

  // Economy
  credit_balance?: number;
  execution_cost?: number;

  // Consequence
  consequence_log?: boolean;

  // Logic
  proof_of_logic?: boolean;

  // Simulation
  simulation_proof?: boolean;
  simulation_valid?: boolean;

  // State
  test_coverage?: number;
  human_approval?: boolean;

  // Risk & Confidence
  confidence?: number;
  risk_score?: number;
  verification_confidence?: number;
  simulation_validity?: number;

  // Additional context
  [key: string]: unknown;
}

// ============================================================================
// STORE STATE
// ============================================================================

export interface PILStoreState {
  // Invariants
  invariants: Record<InvariantId, Invariant>;

  // Statements
  statements: PILStatement[];

  // Validation
  lastValidation: AllInvariantsResult | null;

  // UI State
  editorContent: string;
  parseErrors: string[];

  // Actions
  setInvariantEnabled: (id: InvariantId, enabled: boolean) => void;
  setEnforcementMode: (id: InvariantId, mode: EnforcementMode) => void;
  parseStatements: (content: string) => PILStatement[];
  checkInvariant: (id: InvariantId, context: PILContext) => InvariantCheckResult;
  checkAllInvariants: (context: PILContext) => AllInvariantsResult;
  validateTransition: (from: WorkflowState, to: WorkflowState, context: PILContext) => TransitionValidationResult;
  evaluateGate: (type: GateType, context: PILContext) => GateEvaluationResult;
  calculateTrustScore: (context: PILContext) => number;
  calculateProofDelta: (expected: number, actual: number) => number;
  setEditorContent: (content: string) => void;
  reset: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getInvariantColor(category: InvariantCategory): string {
  const colors: Record<InvariantCategory, string> = {
    authority: '#ef4444',     // Red
    proof: '#f59e0b',         // Amber
    traceability: '#10b981',  // Emerald
    economy: '#3b82f6',       // Blue
    consequence: '#8b5cf6',   // Purple
    logic: '#ec4899',         // Pink
    simulation: '#06b6d4',    // Cyan
  };
  return colors[category];
}

export function getSeverityColor(severity: InvariantSeverity): string {
  const colors: Record<InvariantSeverity, string> = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#65a30d',
  };
  return colors[severity];
}

export function getEnforcementIcon(mode: EnforcementMode): string {
  const icons: Record<EnforcementMode, string> = {
    block: '🛑',
    warn: '⚠️',
    log: '📝',
  };
  return icons[mode];
}

export function getStateColor(state: WorkflowState): string {
  const colors: Record<WorkflowState, string> = {
    draft: '#94a3b8',
    tested: '#3b82f6',
    certified: '#10b981',
    promoted: '#8b5cf6',
    deprecated: '#f59e0b',
    archived: '#6b7280',
  };
  return colors[state];
}
