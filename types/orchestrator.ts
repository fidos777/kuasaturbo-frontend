// Task Definitions
export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  category: 'mortgage' | 'solar' | 'general';
  icon: string;
  costRange: { min: number; max: number };
  avgCost: number;
  successRate: number;
  avgTokens: { min: number; max: number };
  avgDuration: { min: number; max: number };
  inputs: TaskInput[];
  outputs: TaskOutput[];
  limitations: string[];
  supportedFormats?: string[];
}

export interface TaskInput {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface TaskOutput {
  name: string;
  type: string;
  description: string;
}

// Workflow Canvas Types
export interface WorkflowNode {
  id: string;
  taskId: string;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  status: 'idle' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export interface WorkflowConnection {
  id: string;
  sourceNode: string;
  sourceHandle: string;
  targetNode: string;
  targetHandle: string;
}

// ============================================================================
// THE 7 INVARIANTS (Laws of Physics) - Blueprint v2.0
// ============================================================================
// These are the fundamental laws that govern all Qontrek operations.
// Any attempted violation triggers automatic blocking.
// ============================================================================
export const INVARIANTS = {
  I1: { id: 'I1', name: 'No Action Without Authority', check: 'Where is who_authorized?', era: 'Governance' },
  I2: { id: 'I2', name: 'No Reality Without Proof', check: 'Where is the hash?', era: 'Governance' },
  I3: { id: 'I3', name: 'No Trust Without Traceability', check: 'Where is the escalation path?', era: 'Governance' },
  I4: { id: 'I4', name: 'No Economy Without Credits', check: 'Which tenant owns this?', era: 'Governance' },
  I5: { id: 'I5', name: 'No Chaos Without Consequence', check: 'Which ledger drives the money?', era: 'Governance' },
  I6: { id: 'I6', name: 'No Claim Without Mathematical Verification', check: 'Where is the formal proof?', era: 'Verification' },
  I7: { id: 'I7', name: 'No Prediction Without Simulation', check: 'Where is the simulation trace?', era: 'Verification' },
} as const;

export type InvariantId = keyof typeof INVARIANTS;

// ============================================================================
// WORKFLOW STATE MACHINE (Blueprint v2.0)
// ============================================================================
// State Flow: draft → tested → scored → under_review → [sandbox|verified] → certified → promoted
// No shortcuts allowed. Each transition requires explicit gate passage.
// ============================================================================
export type WorkflowStatus =
  | 'draft'        // Initial state - creator only
  | 'tested'       // Simulation passed
  | 'scored'       // Metrics calculated
  | 'under_review' // Proposal submitted to Qontrek
  | 'sandbox'      // Functional but no monetization
  | 'verified'     // Phase 9: Mathematical verification passed (FUTURE)
  | 'certified'    // Audit-ready, human-approved
  | 'promoted'     // Marketplace-eligible, revenue-generating
  | 'rejected'     // Qontrek rejected
  | 'archived';    // Deprecated

// Valid state transitions per Permission Matrix v2.0
export const VALID_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  draft: ['tested'],
  tested: ['scored', 'draft'],
  scored: ['under_review', 'tested'],
  under_review: ['sandbox', 'verified', 'certified', 'rejected'], // Only Qontrek can transition from here
  sandbox: ['certified', 'under_review'],
  verified: ['certified'], // Phase 9: After mathematical verification
  certified: ['promoted', 'archived'],
  promoted: ['archived'],
  rejected: ['draft'], // Can restart from scratch
  archived: [], // Terminal state
};

// Who can perform each transition
export type TransitionActor = 'orchestrator' | 'qontrek';
export const TRANSITION_PERMISSIONS: Record<string, TransitionActor> = {
  'draft→tested': 'orchestrator',
  'tested→scored': 'orchestrator',
  'tested→draft': 'orchestrator',
  'scored→under_review': 'orchestrator',
  'scored→tested': 'orchestrator',
  'under_review→sandbox': 'qontrek',
  'under_review→verified': 'qontrek',
  'under_review→certified': 'qontrek',
  'under_review→rejected': 'qontrek',
  'sandbox→certified': 'qontrek',
  'sandbox→under_review': 'orchestrator',
  'verified→certified': 'qontrek',
  'certified→promoted': 'qontrek',
  'certified→archived': 'orchestrator',
  'promoted→archived': 'orchestrator',
  'rejected→draft': 'orchestrator',
};

// Check if a transition is valid
export function canTransition(
  currentState: WorkflowStatus,
  targetState: WorkflowStatus,
  actor: TransitionActor
): boolean {
  const validTargets = VALID_TRANSITIONS[currentState] || [];
  if (!validTargets.includes(targetState)) return false;

  const transitionKey = `${currentState}→${targetState}`;
  const requiredActor = TRANSITION_PERMISSIONS[transitionKey];
  return requiredActor === actor;
}

// Certification Tiers (from Unified Architecture)
export type WorkflowCertificationTier =
  | 'sandbox'    // Draft/Testing - creator only, no revenue
  | 'certified'  // Human-approved - organization use, internal revenue
  | 'promoted';  // Marketplace-ready - public, 50/30/20 split

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  status: WorkflowStatus;
  visibility: 'public' | 'private' | 'unlisted';
  totalCost: number;
  estimatedRevenue: number;
  createdAt: Date;
  updatedAt: Date;
  stats?: WorkflowStats;
  proofHash?: string;           // Generated on proposal
  proposalId?: string;          // Certification proposal reference
  simulationTrace?: string;     // Invariant 7: Simulation evidence (Phase 9)
  verificationProof?: string;   // Invariant 6: Mathematical proof (Phase 9)
}

export interface WorkflowStats {
  runs: number;
  successRate: number;
  revenue: number;
  lastRun?: Date;
}

// Cost Calculation Types
export interface CostBreakdown {
  taskCosts: { taskId: string; taskName: string; cost: number }[];
  subtotal: number;
  platformFee: number;
  executionCost: number;
  designerCut: number;
}

// Simulation Types
export interface SimulationStep {
  taskId: string;
  taskName: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  input: any;
  output?: any;
  mockTime: number;
  mockCost: number;
  error?: string;
}

export interface SimulationResult {
  steps: SimulationStep[];
  totalSteps: number;
  passedSteps: number;
  totalMockCost: number;
  totalMockTime: number;
  estimatedSuccessRate: number;
}

// Publish Types
export interface PublishDeclarations {
  nonAuthoritative: boolean;
  revenueShare: boolean;
  allowFork: boolean;
  termsAccepted: boolean;
  declareNotActivate: boolean;  // 5th declaration: DECLARE ≠ ACTIVATE ≠ EXECUTE
  proofAuditTrail: boolean;     // 6th declaration: Proof & Audit Trail
}

// Revenue Split Constants
export const REVENUE_SPLIT = {
  EXECUTION: 0.50,    // 50% → API costs
  PLATFORM: 0.30,     // 30% → Platform fee
  DESIGNER: 0.20,     // 20% → Workflow creator
} as const;

// ============================================================================
// CERTIFICATION PROPOSAL (Permission Matrix v2.0)
// ============================================================================
// Orchestrator proposes. Qontrek decides. KuasaTurbo distributes.
// ============================================================================

// Evidence Attachments (formerly Declarations)
export interface EvidenceAttachments {
  nonAuthoritative: boolean;     // "Outputs require human review"
  revenueShare: boolean;         // "Accept 50/30/20 split"
  allowFork: boolean;            // "Allow remix with attribution"
  termsAccepted: boolean;        // "Accept ToS"
  declareNotActivate: boolean;   // "DECLARE ≠ ACTIVATE ≠ EXECUTE"
  proofAuditTrail: boolean;      // "Executions generate proof hash"
}

export interface CertificationProposal {
  proposal_id: string;
  workflow_id: string;
  submitted_at: string;
  submitted_by: string;

  capability: {
    type: 'task' | 'workflow';
    name: string;
    workflow_code: string;
    vertical: string;
  };

  metrics: {
    accuracy_percent: number;
    confidence_score: number;
    failure_rate: number;
    failure_modes: string[];
    tested_runs: number;
  };

  evidence: {
    input_hashes: string[];
    output_hashes: string[];
    proof_hash: string;
    simulation_trace?: string;    // Invariant 7 (Phase 9)
    verification_proof?: string;  // Invariant 6 (Phase 9)
  };

  evidence_attachments: EvidenceAttachments;

  requested_tier: 'sandbox' | 'certified';
  status: 'pending' | 'approved' | 'sandbox' | 'rejected';
}

// ============================================================================
// AUTHORITY SIGNATURE (Soft Gap #1 Fix)
// ============================================================================
// Provides cryptographic proof of who authorized an action
// ============================================================================
export interface AuthoritySignature {
  signer_id: string;             // Who signed
  signer_role: 'orchestrator' | 'qontrek_human' | 'qontrek_system';
  signed_at: string;             // ISO8601 timestamp
  signature_hash: string;        // SHA256 of (action + timestamp + signer_id)
  action_type: string;           // What was authorized
  target_id: string;             // What was affected (workflow_id, etc.)
}

// ============================================================================
// CERTIFICATION DECISION (Soft Gap #2 Fix - with decision_context)
// ============================================================================
// Records Qontrek's decision with full audit trail
// ============================================================================
export interface CertificationDecision {
  proposal_id: string;
  decision: 'approved' | 'sandbox' | 'rejected';
  decided_by: string;            // Who made the decision
  decided_at: string;            // ISO8601 timestamp

  // SOFT GAP #2: Decision context for audit trail
  decision_context: {
    human_decision_reason: string;     // REQUIRED: min 20 chars explaining why
    risk_assessment: 'low' | 'medium' | 'high';
    conditions?: string[];             // Any conditions attached to approval
    similar_cases?: string[];          // References to similar past decisions
    regulatory_notes?: string;         // Compliance considerations
  };

  assigned_tier: WorkflowCertificationTier;
  authority_signature: AuthoritySignature;
}

// ============================================================================
// LIABILITY BOUNDARY (Soft Gap #3 Fix)
// ============================================================================
// Explicit statement that certified ≠ liable
// ============================================================================
export interface LiabilityStatement {
  workflow_id: string;
  version: string;
  effective_date: string;

  disclaimers: {
    qontrek_liability: string;        // "Qontrek certifies capability, not outcome"
    operator_responsibility: string;   // "Operator responsible for use"
    no_warranty: string;              // "No warranty expressed or implied"
  };

  acknowledged_by?: {
    user_id: string;
    acknowledged_at: string;
  };
}

// ============================================================================
// BLUEPRINT v2.0 TAGLINES
// ============================================================================
export const QONTREK_TAGLINES = {
  primary: "Qontrek doesn't regulate AI. It proves AI.",
  constitutional: "Orchestrator discovers capability. Qontrek decides trust. KuasaTurbo distributes value.",
  metrics: "Metrics are descriptive, not normative. Qontrek may override regardless of metric values.",
  economy: "You don't pay for features. You pay for authority level in the AI economy.",
  physics: "Governance isn't paperwork. It's physics.",
} as const;

// ============================================================================
// CREDIT COST MULTIPLIERS (Phase 8.1 Preview)
// ============================================================================
// Trust = Cheaper Execution
// ============================================================================
export const CREDIT_COST_MULTIPLIERS: Record<WorkflowStatus, number | null> = {
  draft: null,          // Cannot run
  tested: 2.0,          // 2x EC - High risk, high cost
  scored: 1.5,          // 1.5x EC - Some evidence, still expensive
  under_review: 1.2,    // 1.2x EC - Pending human decision
  sandbox: 1.0,         // 1x EC - Baseline cost
  verified: 0.8,        // 0.8x EC - Math verified (Phase 9)
  certified: 0.7,       // 0.7x EC - Trust discount
  promoted: 0.5,        // 0.5x EC - Maximum trust, minimum cost
  rejected: null,       // Cannot run
  archived: null,       // Cannot run
};

// ============================================================================
// PHASE 8.1: CREDIT ENGINE
// ============================================================================
// Invariant I4: "No Economy Without Credits" - Which tenant owns this?
// Invariant I5: "No Chaos Without Consequence" - Which ledger drives the money?
// ============================================================================

// Credit Package Types (what users can purchase)
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;           // Number of execution credits
  price_myr: number;         // Price in Malaysian Ringgit
  bonus_credits?: number;    // Bonus credits for larger packages
  popular?: boolean;         // UI highlight
  description?: string;
}

// Predefined Credit Packages
export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', name: 'Starter', credits: 100, price_myr: 10, description: '10 sen per credit' },
  { id: 'basic', name: 'Basic', credits: 500, price_myr: 45, bonus_credits: 50, description: 'Save 10%' },
  { id: 'pro', name: 'Pro', credits: 1000, price_myr: 80, bonus_credits: 200, popular: true, description: 'Most Popular' },
  { id: 'enterprise', name: 'Enterprise', credits: 5000, price_myr: 350, bonus_credits: 1500, description: 'Best Value' },
];

// Tenant Credit Balance
export interface TenantCreditBalance {
  tenant_id: string;
  tenant_name: string;
  balance: number;                    // Current credit balance
  reserved: number;                   // Credits reserved for running jobs
  available: number;                  // balance - reserved
  lifetime_purchased: number;         // Total ever purchased
  lifetime_used: number;              // Total ever consumed
  last_transaction_at?: string;       // ISO8601
  low_balance_threshold: number;      // Alert when below this
  auto_topup_enabled: boolean;
  auto_topup_package_id?: string;
}

// Credit Transaction (Ledger Entry)
export type CreditTransactionType =
  | 'purchase'           // Bought credits
  | 'bonus'              // Bonus credits added
  | 'execution'          // Workflow execution deduction
  | 'refund'             // Refunded due to failure
  | 'reservation'        // Reserved for pending job
  | 'release'            // Released from reservation
  | 'adjustment'         // Manual admin adjustment
  | 'expiry';            // Credits expired

export interface CreditTransaction {
  id: string;
  tenant_id: string;
  type: CreditTransactionType;
  amount: number;                     // Positive for credit, negative for debit
  balance_after: number;              // Balance after this transaction

  // Context
  reference_type?: 'workflow' | 'job' | 'package' | 'admin';
  reference_id?: string;              // workflow_id, job_id, package_id, etc.
  workflow_name?: string;             // For display purposes

  // Trust Economics
  trust_multiplier?: number;          // The multiplier applied (from CREDIT_COST_MULTIPLIERS)
  base_cost?: number;                 // Cost before multiplier

  // Audit
  created_at: string;
  created_by?: string;                // User or system
  description?: string;

  // Proof (Invariant I2)
  proof_hash?: string;                // SHA256 of transaction details
}

// Execution Credit Calculation
export interface ExecutionCreditEstimate {
  workflow_id: string;
  workflow_name: string;
  workflow_status: WorkflowStatus;

  // Base cost breakdown
  base_cost: number;                  // Sum of task costs
  tasks: { task_id: string; task_name: string; cost: number }[];

  // Trust adjustment
  trust_multiplier: number;           // From CREDIT_COST_MULTIPLIERS
  trust_discount_percent: number;     // Human-readable: "30% discount" for promoted

  // Final cost
  final_cost: number;                 // base_cost * trust_multiplier

  // Comparison
  vs_sandbox_cost: number;            // What it would cost at sandbox (1.0x)
  savings_from_trust: number;         // vs_sandbox_cost - final_cost
}

// Job Credit Reservation (for running workflows)
export interface CreditReservation {
  reservation_id: string;
  tenant_id: string;
  workflow_id: string;
  job_id: string;

  estimated_cost: number;             // Credits reserved
  reserved_at: string;
  expires_at: string;                 // Auto-release if job doesn't complete

  status: 'active' | 'consumed' | 'released' | 'expired';
  actual_cost?: number;               // Final cost when consumed
  consumed_at?: string;
  released_at?: string;
}

// Credit Engine Configuration
export interface CreditEngineConfig {
  min_balance_for_execution: number;  // Minimum credits to start a job
  reservation_buffer_percent: number; // Reserve extra % for safety (e.g., 10%)
  reservation_ttl_minutes: number;    // How long reservations last
  low_balance_alert_threshold: number;// When to show low balance warning

  // Rate limiting
  max_concurrent_jobs: number;        // Per tenant
  max_daily_spend: number;            // Per tenant, 0 = unlimited
}

export const DEFAULT_CREDIT_CONFIG: CreditEngineConfig = {
  min_balance_for_execution: 1,
  reservation_buffer_percent: 10,
  reservation_ttl_minutes: 30,
  low_balance_alert_threshold: 50,
  max_concurrent_jobs: 5,
  max_daily_spend: 0,
};

// Helper function to calculate execution cost
export function calculateExecutionCost(
  baseCost: number,
  workflowStatus: WorkflowStatus
): ExecutionCreditEstimate | null {
  const multiplier = CREDIT_COST_MULTIPLIERS[workflowStatus];

  if (multiplier === null) {
    return null; // Cannot execute in this state
  }

  const finalCost = Math.ceil(baseCost * multiplier);
  const sandboxCost = Math.ceil(baseCost * 1.0);

  return {
    workflow_id: '',
    workflow_name: '',
    workflow_status: workflowStatus,
    base_cost: baseCost,
    tasks: [],
    trust_multiplier: multiplier,
    trust_discount_percent: Math.round((1 - multiplier) * 100),
    final_cost: finalCost,
    vs_sandbox_cost: sandboxCost,
    savings_from_trust: sandboxCost - finalCost,
  };
}

// Credit check result
export interface CreditCheckResult {
  can_execute: boolean;
  reason?: string;

  available_credits: number;
  required_credits: number;
  shortfall?: number;

  suggested_package?: CreditPackage;
}
