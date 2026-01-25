'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Play, Rocket, ShieldCheck, ShieldAlert, RotateCcw, Download } from 'lucide-react';
import TaskLibrary from './components/TaskLibrary';
import TaskDetailModal from './components/TaskDetailModal';
import WorkflowCanvas from './components/WorkflowCanvas';
import CostCalculator from './components/CostCalculator';
import SimulationMode from './components/SimulationMode';
import PublishFlow from './components/PublishFlow';
import SemanticFirewall from './components/SemanticFirewall';
import ExportAuditButton from './components/ExportAuditButton';
import TrustBadge from '@/app/components/governance/TrustBadge';
import { TaskDefinition } from '@/types/orchestrator';
import { useWorkflowStore } from '@/store/workflowStore';
import { useCreditStore } from '@/store/creditStore';
import CreditBalance from '@/app/components/credits/CreditBalance';
import CreditPurchaseModal from '@/app/components/credits/CreditPurchaseModal';

export default function OrchestratorPage() {
  const initialized = useRef(false);
  const currentWorkflow = useWorkflowStore(state => state.currentWorkflow);
  const nodes = useWorkflowStore(state => state.nodes);
  const createNewWorkflow = useWorkflowStore(state => state.createNewWorkflow);
  const addNode = useWorkflowStore(state => state.addNode);
  const saveWorkflow = useWorkflowStore(state => state.saveWorkflow);
  const reset = useWorkflowStore(state => state.reset);
  const resetSimulation = useWorkflowStore(state => state.resetSimulation);

  // Initialize credit balance on mount
  const initializeBalance = useCreditStore(state => state.initializeBalance);
  useEffect(() => {
    initializeBalance('demo-tenant-001', 'Demo User');
  }, [initializeBalance]);

  // Modal states
  const [selectedTask, setSelectedTask] = useState<TaskDefinition | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  // Create new workflow on mount if none exists - only once
  useEffect(() => {
    if (!initialized.current && !currentWorkflow) {
      initialized.current = true;
      createNewWorkflow();
    }
  }, []);

  const handleViewTask = (task: TaskDefinition) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = (task: TaskDefinition) => {
    const offset = nodes.length * 30;
    addNode(task.id, { x: 200 + offset, y: 100 + offset });
  };

  const handleNodeSelect = (nodeId: string | null) => {
    // Can be used for showing node details in sidebar
  };

  // Day-4: Demo Reset - clears everything for fresh demo
  const handleDemoReset = () => {
    reset();
    resetSimulation();
    createNewWorkflow();
  };

  // Day-4: Determine current step for happy path highlight
  const getCurrentStep = (): 1 | 2 | 3 => {
    if (currentWorkflow?.isApproved) return 3;
    if (nodes.length > 0) return 2;
    return 1;
  };
  const currentStep = getCurrentStep();

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Semantic Firewall Banner */}
      <SemanticFirewall variant="banner" />

      {/* Day-4: 3-Click Happy Path Guide - Design Constitution compliant */}
      <div className="bg-gray-800/80 border-b border-gray-700 px-6 py-2">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-white' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 1 ? 'bg-action-primary text-white' : currentStep > 1 ? 'bg-authority-primary text-white' : 'bg-gray-700'
            }`}>1</span>
            <span className={currentStep === 1 ? 'font-medium' : ''}>Build workflow</span>
          </div>
          <div className="text-gray-600">→</div>
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-white' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 2 ? 'bg-action-primary text-white' : currentStep > 2 ? 'bg-authority-primary text-white' : 'bg-gray-700'
            }`}>2</span>
            <span className={currentStep === 2 ? 'font-medium' : ''}>Publish & certify</span>
          </div>
          <div className="text-gray-600">→</div>
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-white' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 3 ? 'bg-authority-primary text-white' : 'bg-gray-700'
            }`}>3</span>
            <span className={currentStep === 3 ? 'font-medium' : ''}>Export audit proof</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-action-primary">ORCHESTRATOR</h1>
          <SemanticFirewall variant="badge" />
          <span className="text-sm text-gray-400">
            {currentWorkflow?.name || 'New Workflow'}
          </span>
          {/* Trust Status Badge - Design Constitution compliant */}
          {currentWorkflow && (
            currentWorkflow.isApproved ? (
              <TrustBadge tier="certified" />
            ) : (
              <TrustBadge tier="underReview" label="Needs certification" />
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Day-4: Demo Reset Button */}
          <button
            onClick={handleDemoReset}
            className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            title="Reset demo to start fresh"
          >
            <RotateCcw size={14} />
            Reset Demo
          </button>

          <div className="w-px h-6 bg-gray-700" />

          {/* Credit Balance Display (Phase 8.1) */}
          <CreditBalance
            variant="compact"
            showTopUp={true}
            currentWorkflowStatus={currentWorkflow?.status || 'sandbox'}
          />

          <div className="w-px h-6 bg-gray-700" />

          <button
            onClick={saveWorkflow}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>

          {/* Export Audit Button - with step badge when active */}
          <div className="relative">
            {currentStep === 3 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-authority-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10">3</span>
            )}
            <ExportAuditButton />
          </div>

          <button
            onClick={() => setIsSimulationOpen(true)}
            disabled={nodes.length === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              nodes.length > 0
                ? 'bg-action-primary hover:bg-action-hover text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play size={16} />
            Run Test
          </button>

          {/* Publish Button - with step badge when active */}
          {/* ORANGE = ACTION per Design Constitution */}
          <div className="relative">
            {currentStep === 2 && nodes.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-action-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10">2</span>
            )}
            <button
              onClick={() => setIsPublishOpen(true)}
              disabled={nodes.length === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                nodes.length > 0
                  ? 'bg-action-primary hover:bg-action-hover text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Rocket size={16} />
              Submit for Certification
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Task Library with step badge */}
        <aside className="w-72 border-r border-gray-700 bg-gray-800/30 flex-shrink-0 relative">
          {currentStep === 1 && (
            <div className="absolute top-2 right-2 z-10">
              <span className="w-6 h-6 bg-action-primary rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
            </div>
          )}
          <TaskLibrary onViewTask={handleViewTask} onAddTask={handleAddTask} />
        </aside>

        {/* Center - Workflow Canvas */}
        <main className="flex-1 relative" data-audit-canvas>
          <WorkflowCanvas onNodeSelect={handleNodeSelect} />
        </main>

        {/* Right Sidebar - Cost Calculator */}
        <aside className="w-80 border-l border-gray-700 bg-gray-800/30 flex-shrink-0">
          <CostCalculator />
        </aside>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onAddToFlow={() => handleAddTask(selectedTask)}
        />
      )}

      <SimulationMode
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        onProceedToPublish={() => setIsPublishOpen(true)}
      />

      <PublishFlow
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onPublishSuccess={() => {}}
      />

      {/* Credit Purchase Modal (Phase 8.1) */}
      <CreditPurchaseModal />
    </div>
  );
}
