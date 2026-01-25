import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  WorkflowNode,
  WorkflowConnection,
  Workflow,
  CostBreakdown,
  SimulationStep,
  SimulationResult,
  PublishDeclarations,
  REVENUE_SPLIT,
  WorkflowStatus
} from '@/types/orchestrator';
import { getTaskById, TASK_DEFINITIONS } from '@/app/playground/orchestrator/data/tasks';

interface WorkflowState {
  // Current workflow being edited
  currentWorkflow: Workflow | null;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];

  // UI State
  selectedNodeId: string | null;
  isExecuting: boolean;
  isSimulating: boolean;

  // Simulation
  simulationResult: SimulationResult | null;

  // Publish
  publishDeclarations: PublishDeclarations;

  // Saved workflows
  savedWorkflows: Workflow[];

  // Actions - Workflow Management
  createNewWorkflow: (name?: string) => void;
  loadWorkflow: (workflowId: string) => void;
  saveWorkflow: () => void;

  // Actions - Node Management
  addNode: (taskId: string, position: { x: number; y: number }) => void;
  removeNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateNodeParameters: (nodeId: string, params: Record<string, any>) => void;
  updateNodeStatus: (nodeId: string, status: WorkflowNode['status'], result?: any, error?: string) => void;
  selectNode: (nodeId: string | null) => void;

  // Actions - Connection Management
  addConnection: (connection: Omit<WorkflowConnection, 'id'>) => void;
  removeConnection: (connectionId: string) => void;

  // Actions - Cost Calculation
  calculateCostBreakdown: () => CostBreakdown;

  // Actions - Simulation
  runSimulation: () => Promise<SimulationResult>;
  resetSimulation: () => void;

  // Actions - Publish
  updatePublishDeclarations: (declarations: Partial<PublishDeclarations>) => void;
  publishWorkflow: (name: string, description: string, category: string, visibility: 'public' | 'private' | 'unlisted') => void;

  // Actions - Human Approval Gate (Day-1)
  setApproval: (approved: boolean) => void;

  // Actions - Reset
  reset: () => void;
}

const initialPublishDeclarations: PublishDeclarations = {
  nonAuthoritative: false,
  revenueShare: false,
  allowFork: false,
  termsAccepted: false,
  declareNotActivate: false,
  proofAuditTrail: false,
};

// Mock saved workflows for demo
const mockSavedWorkflows: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Mortgage Document Processor',
    description: 'Extracts, formats, validates mortgage docs',
    category: 'mortgage',
    nodes: [],
    connections: [],
    status: 'certified',
    visibility: 'public',
    totalCost: 2.20,
    estimatedRevenue: 0.44,
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-01-20'),
    stats: {
      runs: 89,
      successRate: 91,
      revenue: 39.16,
      lastRun: new Date('2026-01-20T10:00:00'),
    },
  },
  {
    id: 'wf-2',
    name: 'Solar Quote Formatter',
    description: 'Formats and validates solar installation quotes',
    category: 'solar',
    nodes: [],
    connections: [],
    status: 'certified',
    visibility: 'public',
    totalCost: 1.30,
    estimatedRevenue: 0.26,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-19'),
    stats: {
      runs: 34,
      successRate: 88,
      revenue: 14.96,
      lastRun: new Date('2026-01-19T14:00:00'),
    },
  },
  {
    id: 'wf-3',
    name: 'Lead Qualifier v2',
    description: 'Qualifies and scores incoming leads',
    category: 'general',
    nodes: [],
    connections: [],
    status: 'draft',
    visibility: 'private',
    totalCost: 1.80,
    estimatedRevenue: 0.36,
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
  },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial State
  currentWorkflow: null,
  nodes: [],
  connections: [],
  selectedNodeId: null,
  isExecuting: false,
  isSimulating: false,
  simulationResult: null,
  publishDeclarations: initialPublishDeclarations,
  savedWorkflows: mockSavedWorkflows,

  // Workflow Management
  createNewWorkflow: (name = 'Untitled Workflow') => {
    set({
      currentWorkflow: {
        id: uuidv4(),
        name,
        description: '',
        category: 'general',
        nodes: [],
        connections: [],
        status: 'draft',
        visibility: 'private',
        totalCost: 0,
        estimatedRevenue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      nodes: [],
      connections: [],
      selectedNodeId: null,
      simulationResult: null,
      publishDeclarations: initialPublishDeclarations,
    });
  },

  loadWorkflow: (workflowId: string) => {
    const workflow = get().savedWorkflows.find(wf => wf.id === workflowId);
    if (workflow) {
      set({
        currentWorkflow: { ...workflow },
        nodes: [...workflow.nodes],
        connections: [...workflow.connections],
        selectedNodeId: null,
        simulationResult: null,
      });
    }
  },

  saveWorkflow: () => {
    const { currentWorkflow, nodes, connections, savedWorkflows } = get();
    if (!currentWorkflow) return;

    const costBreakdown = get().calculateCostBreakdown();
    const updatedWorkflow: Workflow = {
      ...currentWorkflow,
      nodes: [...nodes],
      connections: [...connections],
      totalCost: costBreakdown.subtotal,
      estimatedRevenue: costBreakdown.designerCut,
      updatedAt: new Date(),
    };

    const existingIndex = savedWorkflows.findIndex(wf => wf.id === currentWorkflow.id);
    const newSavedWorkflows = [...savedWorkflows];

    if (existingIndex >= 0) {
      newSavedWorkflows[existingIndex] = updatedWorkflow;
    } else {
      newSavedWorkflows.push(updatedWorkflow);
    }

    set({
      currentWorkflow: updatedWorkflow,
      savedWorkflows: newSavedWorkflows,
    });
  },

  // Node Management
  addNode: (taskId: string, position: { x: number; y: number }) => {
    const task = getTaskById(taskId);
    if (!task) return;

    const newNode: WorkflowNode = {
      id: uuidv4(),
      taskId,
      position,
      parameters: {},
      status: 'idle',
    };

    set(state => ({
      nodes: [...state.nodes, newNode],
    }));
  },

  removeNode: (nodeId: string) => {
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      connections: state.connections.filter(
        c => c.sourceNode !== nodeId && c.targetNode !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, position } : n
      ),
    }));
  },

  updateNodeParameters: (nodeId: string, params: Record<string, any>) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, parameters: { ...n.parameters, ...params } } : n
      ),
    }));
  },

  updateNodeStatus: (nodeId: string, status: WorkflowNode['status'], result?: any, error?: string) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, status, result, error } : n
      ),
    }));
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  // Connection Management
  addConnection: (connection: Omit<WorkflowConnection, 'id'>) => {
    const newConnection: WorkflowConnection = {
      ...connection,
      id: uuidv4(),
    };

    set(state => ({
      connections: [...state.connections, newConnection],
    }));
  },

  removeConnection: (connectionId: string) => {
    set(state => ({
      connections: state.connections.filter(c => c.id !== connectionId),
    }));
  },

  // Cost Calculation
  calculateCostBreakdown: (): CostBreakdown => {
    const { nodes } = get();

    const taskCosts = nodes.map(node => {
      const task = getTaskById(node.taskId);
      return {
        taskId: node.taskId,
        taskName: task?.name || 'Unknown',
        cost: task?.avgCost || 0,
      };
    });

    const subtotal = taskCosts.reduce((sum, tc) => sum + tc.cost, 0);
    const executionCost = subtotal * REVENUE_SPLIT.EXECUTION;
    const platformFee = subtotal * REVENUE_SPLIT.PLATFORM;
    const designerCut = subtotal * REVENUE_SPLIT.DESIGNER;

    return {
      taskCosts,
      subtotal,
      executionCost,
      platformFee,
      designerCut,
    };
  },

  // Simulation
  runSimulation: async (): Promise<SimulationResult> => {
    const { nodes, connections, currentWorkflow } = get();

    // Day-1 Approval Gate: Block execution unless approved
    if (!currentWorkflow?.isApproved) {
      console.warn('[BLOCKED] Workflow not approved by human. Execution denied.');
      return {
        steps: [],
        totalSteps: 0,
        passedSteps: 0,
        totalMockCost: 0,
        totalMockTime: 0,
        estimatedSuccessRate: 0,
      };
    }

    set({ isSimulating: true });

    // Sort nodes by connection order (topological sort simplified)
    const sortedNodes = [...nodes];

    const steps: SimulationStep[] = [];
    let totalMockTime = 0;
    let totalMockCost = 0;
    let passedSteps = 0;

    for (const node of sortedNodes) {
      const task = getTaskById(node.taskId);
      if (!task) continue;

      // Create step
      const step: SimulationStep = {
        taskId: node.taskId,
        taskName: task.name,
        status: 'running',
        input: getMockInput(node.taskId),
        mockTime: (task.avgDuration.min + task.avgDuration.max) / 2,
        mockCost: task.avgCost,
      };

      steps.push(step);

      // Update node status
      get().updateNodeStatus(node.id, 'running');

      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Determine pass/fail based on success rate (mock always passes for demo)
      const passed = Math.random() * 100 < task.successRate;

      if (passed) {
        step.status = 'pass';
        step.output = getMockOutput(node.taskId);
        passedSteps++;
        get().updateNodeStatus(node.id, 'completed', step.output);
      } else {
        step.status = 'fail';
        step.error = 'Simulated failure for demonstration';
        get().updateNodeStatus(node.id, 'error', undefined, step.error);
      }

      totalMockTime += step.mockTime;
      totalMockCost += step.mockCost;
    }

    // Calculate estimated success rate
    const individualRates = sortedNodes.map(node => {
      const task = getTaskById(node.taskId);
      return task?.successRate || 100;
    });
    const estimatedSuccessRate = individualRates.reduce((a, b) => (a * b) / 100, 100);

    const result: SimulationResult = {
      steps,
      totalSteps: steps.length,
      passedSteps,
      totalMockCost,
      totalMockTime,
      estimatedSuccessRate: Math.round(estimatedSuccessRate),
    };

    set({ isSimulating: false, simulationResult: result });
    return result;
  },

  resetSimulation: () => {
    const { nodes } = get();
    // Reset all node statuses
    nodes.forEach(node => {
      get().updateNodeStatus(node.id, 'idle');
    });
    set({ simulationResult: null });
  },

  // Publish
  updatePublishDeclarations: (declarations: Partial<PublishDeclarations>) => {
    set(state => ({
      publishDeclarations: { ...state.publishDeclarations, ...declarations },
    }));
  },

  // CONSTITUTIONAL: This function PROPOSES for certification
  // It does NOT certify. Only Qontrek can transition to 'certified'.
  // Status becomes 'under_review', NOT 'certified'.
  publishWorkflow: (name: string, description: string, category: string, visibility: 'public' | 'private' | 'unlisted') => {
    const { currentWorkflow, nodes, connections, savedWorkflows, publishDeclarations } = get();

    // Validate all evidence attachments are acknowledged (6 per Unified Architecture)
    if (!Object.values(publishDeclarations).every(v => v)) {
      throw new Error('All 6 evidence attachments must be acknowledged before proposal');
    }

    const costBreakdown = get().calculateCostBreakdown();

    // Generate proof hash for audit trail (simplified version for MVP)
    const timestamp = new Date().toISOString();
    const workflowId = currentWorkflow?.id || uuidv4();
    const proofInput = `${workflowId}:${timestamp}:${nodes.length}:v1`;
    const proofHash = `proof_${btoa(proofInput).slice(0, 24)}`;
    const proposalId = `prop_${btoa(proofInput).slice(0, 16)}`;

    // CONSTITUTIONAL: Status is 'under_review', NOT 'certified'
    // Only Qontrek can transition to 'sandbox', 'certified', or 'promoted'
    // This enforces: "Orchestrator discovers capability. Qontrek decides trust."
    const proposedWorkflow: Workflow = {
      id: workflowId,
      name,
      description,
      category,
      nodes: [...nodes],
      connections: [...connections],
      status: 'under_review',  // Awaiting Qontrek decision (NOT 'certified')
      visibility,
      totalCost: costBreakdown.subtotal,
      estimatedRevenue: costBreakdown.designerCut,
      createdAt: currentWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
      proofHash,      // Evidence hash for audit trail
      proposalId,     // Certification proposal reference
      stats: {
        runs: 0,
        successRate: 0,
        revenue: 0,
      },
    };

    const existingIndex = savedWorkflows.findIndex(wf => wf.id === proposedWorkflow.id);
    const newSavedWorkflows = [...savedWorkflows];

    if (existingIndex >= 0) {
      newSavedWorkflows[existingIndex] = proposedWorkflow;
    } else {
      newSavedWorkflows.push(proposedWorkflow);
    }

    set({
      currentWorkflow: proposedWorkflow,
      savedWorkflows: newSavedWorkflows,
    });
  },

  // Human Approval Gate (Day-1 Implementation)
  setApproval: (approved: boolean) => {
    const { currentWorkflow, savedWorkflows } = get();
    if (!currentWorkflow) return;

    const updatedWorkflow = {
      ...currentWorkflow,
      isApproved: approved,
      approvedAt: approved ? new Date().toISOString() : undefined,
      approvedBy: approved ? 'human (simulated)' : undefined,
    };

    // Update in saved workflows as well
    const newSavedWorkflows = savedWorkflows.map(wf =>
      wf.id === currentWorkflow.id ? updatedWorkflow : wf
    );

    set({
      currentWorkflow: updatedWorkflow,
      savedWorkflows: newSavedWorkflows,
    });

    console.log(`[APPROVAL] Workflow ${approved ? 'APPROVED' : 'REVOKED'} by human at ${updatedWorkflow.approvedAt}`);
  },

  // Reset
  reset: () => {
    set({
      currentWorkflow: null,
      nodes: [],
      connections: [],
      selectedNodeId: null,
      isExecuting: false,
      isSimulating: false,
      simulationResult: null,
      publishDeclarations: initialPublishDeclarations,
    });
  },
}));

// Helper functions for mock data
function getMockInput(taskId: string): any {
  const mockInputs: Record<string, any> = {
    Z4: { raw_document: 'Sample mortgage document content...', transform_type: 'mortgage_eligibility_summary' },
    Z5: { document: 'sample_mortgage_doc.pdf' },
    Z6: { document_a: 'contract_v1.pdf', document_b: 'contract_v2.pdf' },
    Z7: { data: { applicant: 'John Doe', income: 8500 }, validation_rules: {} },
    Z8: { document: 'Extracted and formatted data from previous steps...', summary_length: 'standard' },
    Z9: { source_file: 'report.json', target_format: 'pdf' },
  };
  return mockInputs[taskId] || {};
}

function getMockOutput(taskId: string): any {
  const mockOutputs: Record<string, any> = {
    Z4: { formatted: true, template: 'standard', data: { formatted_content: '...' } },
    Z5: { applicant: 'John Doe', income: 8500, loan_amount: 450000, property_value: 550000 },
    Z6: { differences: ['Clause 3.2 modified', 'New section 7 added'], similarities: ['Pricing unchanged'] },
    Z7: { valid: true, warnings: [], errors: [] },
    Z8: { summary: 'Applicant qualifies for the requested mortgage amount based on income and credit score...', key_points: ['Income verified', 'Credit score: 750'] },
    Z9: { converted_file: 'report.pdf', conversion_status: 'success' },
  };
  return mockOutputs[taskId] || {};
}
