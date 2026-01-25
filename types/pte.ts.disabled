// ============================================================================
// PTE (PROOF-TIME EXECUTION) TYPE DEFINITIONS
// Sprint 4: PTE Module - Proof-Time Execution with audit trail
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// Invariant I5: "No Silence Without Signal" — Every interaction produces a trace
// Invariant I6: "No Memory Without Merit" — Persistence is earned through proof
// ============================================================================

import { MalaysianSector } from './qpi';

// ============================================================================
// EXECUTION LIFECYCLE STATES
// ============================================================================

// Execution phases (aligned with proof generation)
export type ExecutionPhase =
  | 'initializing'    // Setting up execution context
  | 'validating'      // Validating inputs against constraints
  | 'executing'       // Active execution in progress
  | 'verifying'       // Verifying outputs against expectations
  | 'finalizing'      // Generating final proof
  | 'completed'       // Successfully completed with proof
  | 'failed'          // Execution failed (with failure proof)
  | 'rolled_back';    // Execution rolled back (with rollback proof)

// Proof generation timing
export type ProofTiming =
  | 'pre_execution'   // Before execution starts
  | 'mid_execution'   // During execution (checkpoints)
  | 'post_execution'  // After execution completes
  | 'on_failure'      // When execution fails
  | 'on_rollback';    // When execution is rolled back

// ============================================================================
// EXECUTION CONTEXT
// ============================================================================

// Input validation result
export interface InputValidation {
  field: string;
  value: unknown;
  constraint: string;
  valid: boolean;
  errorMessage?: string;
  validatedAt: string;
}

// Execution context (immutable once created)
export interface ExecutionContext {
  id: string;
  workflowId: string;
  taskId: string;
  tenantId: string;
  sector: MalaysianSector;

  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;

  // Input/Output hashes for integrity
  inputHash: string;
  expectedOutputHash?: string;
  actualOutputHash?: string;

  // Validation
  inputValidations: InputValidation[];
  allInputsValid: boolean;

  // Execution metadata
  executorId: string;          // Agent/service that executed
  executorVersion: string;     // Version of executor
  environmentHash: string;     // Hash of execution environment

  // Resource tracking
  creditsReserved: number;
  creditsConsumed: number;

  // Parent context (for nested executions)
  parentContextId?: string;
  childContextIds: string[];
}

// ============================================================================
// PROOF STRUCTURES
// ============================================================================

// Proof type enumeration
export type PTEProofType =
  | 'execution_start'      // Proof that execution started
  | 'checkpoint'           // Mid-execution checkpoint proof
  | 'execution_complete'   // Proof of successful completion
  | 'execution_failed'     // Proof of failure with reason
  | 'rollback'            // Proof of rollback operation
  | 'verification'        // Output verification proof
  | 'attestation';        // Human/external attestation

// Individual proof record
export interface PTEProof {
  id: string;
  contextId: string;
  type: PTEProofType;
  timing: ProofTiming;
  phase: ExecutionPhase;

  // Proof content
  proofHash: string;
  previousProofHash?: string;  // Chain link
  merkleRoot?: string;         // For batched proofs

  // Timestamps
  generatedAt: string;
  validUntil?: string;         // Optional expiry

  // Proof data
  data: {
    inputSnapshot?: string;    // Hash of inputs at this point
    outputSnapshot?: string;   // Hash of outputs at this point
    stateSnapshot?: string;    // Hash of execution state
    metrics?: ExecutionMetrics;
    errorDetails?: ErrorDetails;
    attestation?: AttestationData;
  };

  // Verification
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;

  // Metadata
  sequenceNumber: number;      // Order in proof chain
  tags: string[];
}

// Execution metrics captured in proof
export interface ExecutionMetrics {
  durationMs: number;
  cpuTimeMs?: number;
  memoryPeakMb?: number;
  ioOperations?: number;
  apiCalls?: number;
  tokensProcessed?: number;
  creditsUsed: number;
}

// Error details for failure proofs
export interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
  phase: ExecutionPhase;
  recoverable: boolean;
  retryable: boolean;
  suggestedAction?: string;
}

// Attestation data for human/external verification
export interface AttestationData {
  attesterId: string;
  attesterType: 'human' | 'service' | 'oracle';
  statement: string;
  evidence?: string;
  signatureHash: string;
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

// Audit event types
export type AuditEventType =
  | 'context_created'
  | 'execution_started'
  | 'checkpoint_reached'
  | 'output_generated'
  | 'verification_passed'
  | 'verification_failed'
  | 'error_occurred'
  | 'retry_attempted'
  | 'rollback_initiated'
  | 'execution_completed'
  | 'proof_generated'
  | 'proof_verified'
  | 'attestation_added';

// Audit event record
export interface AuditEvent {
  id: string;
  contextId: string;
  type: AuditEventType;
  timestamp: string;

  // Event details
  phase: ExecutionPhase;
  actor: string;              // Who/what triggered this event
  actorType: 'system' | 'agent' | 'human' | 'external';

  // Event data
  details: Record<string, unknown>;

  // Proof linkage
  relatedProofId?: string;

  // Integrity
  eventHash: string;
  previousEventHash?: string;
}

// Complete audit trail for an execution
export interface AuditTrail {
  contextId: string;
  workflowId: string;

  // Events in chronological order
  events: AuditEvent[];

  // Summary
  eventCount: number;
  firstEventAt: string;
  lastEventAt: string;

  // Integrity
  trailIntegrity: 'valid' | 'broken' | 'pending';
  integrityCheckedAt?: string;

  // Linked proofs
  proofIds: string[];
}

// ============================================================================
// EXECUTION RESULT
// ============================================================================

// Final execution result
export interface ExecutionResult {
  contextId: string;
  success: boolean;

  // Output
  output?: unknown;
  outputHash?: string;

  // Timing
  startedAt: string;
  completedAt: string;
  durationMs: number;

  // Proofs generated
  proofs: PTEProof[];
  proofChainValid: boolean;

  // Metrics
  metrics: ExecutionMetrics;

  // Errors (if any)
  errors: ErrorDetails[];

  // Audit trail reference
  auditTrailId: string;
}

// ============================================================================
// PTE CONFIGURATION
// ============================================================================

// Proof generation policy
export interface ProofPolicy {
  // When to generate proofs
  generateOnStart: boolean;
  generateOnComplete: boolean;
  generateOnFailure: boolean;
  generateOnRollback: boolean;

  // Checkpoint configuration
  checkpointEnabled: boolean;
  checkpointIntervalMs?: number;
  checkpointOnStateChange: boolean;

  // Verification
  requireVerification: boolean;
  verificationTimeoutMs: number;

  // Retention
  proofRetentionDays: number;
  auditRetentionDays: number;
}

// PTE module configuration
export interface PTEConfig {
  // Global settings
  enabled: boolean;
  strictMode: boolean;          // Fail if proof generation fails

  // Proof policy
  proofPolicy: ProofPolicy;

  // Performance
  maxConcurrentExecutions: number;
  executionTimeoutMs: number;

  // Security
  requireSignedProofs: boolean;
  encryptSensitiveData: boolean;

  // Integration
  notifyOnFailure: boolean;
  webhookUrl?: string;
}

// Default configuration
export const DEFAULT_PTE_CONFIG: PTEConfig = {
  enabled: true,
  strictMode: true,

  proofPolicy: {
    generateOnStart: true,
    generateOnComplete: true,
    generateOnFailure: true,
    generateOnRollback: true,
    checkpointEnabled: true,
    checkpointIntervalMs: 5000,
    checkpointOnStateChange: true,
    requireVerification: true,
    verificationTimeoutMs: 30000,
    proofRetentionDays: 90,
    auditRetentionDays: 365,
  },

  maxConcurrentExecutions: 10,
  executionTimeoutMs: 300000,  // 5 minutes

  requireSignedProofs: true,
  encryptSensitiveData: true,

  notifyOnFailure: true,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Generate a deterministic hash from data
export function generatePTEHash(data: string): string {
  // In production, use actual SHA-256
  const hash = Array.from(data)
    .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)
    .toString(16)
    .padStart(64, '0');
  return `pte-${hash.slice(0, 56)}`;
}

// Generate execution context ID
export function generateContextId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `ctx-${timestamp}-${random}`;
}

// Generate proof ID
export function generateProofId(contextId: string, type: PTEProofType): string {
  const timestamp = Date.now().toString(36);
  return `proof-${contextId.slice(4, 12)}-${type.slice(0, 4)}-${timestamp}`;
}

// Generate audit event ID
export function generateAuditEventId(contextId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `audit-${contextId.slice(4, 12)}-${timestamp}-${random}`;
}

// Calculate proof chain integrity
export function verifyProofChain(proofs: PTEProof[]): boolean {
  if (proofs.length === 0) return true;

  for (let i = 1; i < proofs.length; i++) {
    if (proofs[i].previousProofHash !== proofs[i - 1].proofHash) {
      return false;
    }
  }
  return true;
}

// Calculate audit trail integrity
export function verifyAuditTrail(events: AuditEvent[]): boolean {
  if (events.length === 0) return true;

  for (let i = 1; i < events.length; i++) {
    if (events[i].previousEventHash !== events[i - 1].eventHash) {
      return false;
    }
  }
  return true;
}

// Get phase display name
export function getPhaseDisplayName(phase: ExecutionPhase): string {
  const names: Record<ExecutionPhase, string> = {
    initializing: 'Initializing',
    validating: 'Validating Inputs',
    executing: 'Executing',
    verifying: 'Verifying Outputs',
    finalizing: 'Finalizing',
    completed: 'Completed',
    failed: 'Failed',
    rolled_back: 'Rolled Back',
  };
  return names[phase];
}

// Get proof type display name
export function getProofTypeDisplayName(type: PTEProofType): string {
  const names: Record<PTEProofType, string> = {
    execution_start: 'Execution Start',
    checkpoint: 'Checkpoint',
    execution_complete: 'Execution Complete',
    execution_failed: 'Execution Failed',
    rollback: 'Rollback',
    verification: 'Verification',
    attestation: 'Attestation',
  };
  return names[type];
}

// ============================================================================
// SAMPLE DATA FOR DEMO
// ============================================================================

export function generateSampleExecutionContext(
  workflowId: string,
  sector: MalaysianSector
): ExecutionContext {
  const contextId = generateContextId();
  const now = new Date().toISOString();

  return {
    id: contextId,
    workflowId,
    taskId: `task-${Math.random().toString(36).substr(2, 8)}`,
    tenantId: 'demo-tenant-001',
    sector,
    createdAt: now,
    inputHash: generatePTEHash(`input-${contextId}-${Date.now()}`),
    inputValidations: [
      {
        field: 'query',
        value: 'sample query',
        constraint: 'non-empty string',
        valid: true,
        validatedAt: now,
      },
      {
        field: 'maxTokens',
        value: 1000,
        constraint: 'number between 1 and 4096',
        valid: true,
        validatedAt: now,
      },
    ],
    allInputsValid: true,
    executorId: 'agent-demo-001',
    executorVersion: '1.0.0',
    environmentHash: generatePTEHash(`env-${Date.now()}`),
    creditsReserved: 50,
    creditsConsumed: 0,
    childContextIds: [],
  };
}

export function generateSampleProof(
  context: ExecutionContext,
  type: PTEProofType,
  sequenceNumber: number,
  previousHash?: string
): PTEProof {
  const proofId = generateProofId(context.id, type);
  const now = new Date().toISOString();

  return {
    id: proofId,
    contextId: context.id,
    type,
    timing: type === 'execution_start' ? 'pre_execution' :
            type === 'checkpoint' ? 'mid_execution' : 'post_execution',
    phase: type === 'execution_start' ? 'initializing' :
           type === 'execution_complete' ? 'completed' :
           type === 'execution_failed' ? 'failed' : 'executing',
    proofHash: generatePTEHash(`${proofId}-${Date.now()}`),
    previousProofHash: previousHash,
    generatedAt: now,
    data: {
      inputSnapshot: context.inputHash,
      metrics: {
        durationMs: Math.floor(Math.random() * 5000) + 500,
        creditsUsed: Math.floor(Math.random() * 30) + 5,
      },
    },
    verified: type !== 'checkpoint',
    verifiedAt: type !== 'checkpoint' ? now : undefined,
    sequenceNumber,
    tags: [context.sector, type],
  };
}
