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
  status: 'draft' | 'sandbox' | 'certified' | 'promoted' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  totalCost: number;
  estimatedRevenue: number;
  createdAt: Date;
  updatedAt: Date;
  stats?: WorkflowStats;
  proofHash?: string;  // Generated on activation
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
