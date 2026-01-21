'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Play, Rocket } from 'lucide-react';
import TaskLibrary from './components/TaskLibrary';
import TaskDetailModal from './components/TaskDetailModal';
import WorkflowCanvas from './components/WorkflowCanvas';
import CostCalculator from './components/CostCalculator';
import SimulationMode from './components/SimulationMode';
import PublishFlow from './components/PublishFlow';
import SemanticFirewall from './components/SemanticFirewall';
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

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Semantic Firewall Banner */}
      <SemanticFirewall variant="banner" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-purple-500">ORCHESTRATOR</h1>
          <SemanticFirewall variant="badge" />
          <span className="text-sm text-gray-400">
            {currentWorkflow?.name || 'New Workflow'}
          </span>
        </div>

        <div className="flex items-center gap-3">
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
          <button
            onClick={() => setIsSimulationOpen(true)}
            disabled={nodes.length === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              nodes.length > 0
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play size={16} />
            Simulate
          </button>
          <button
            onClick={() => setIsPublishOpen(true)}
            disabled={nodes.length === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              nodes.length > 0
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Rocket size={16} />
            Activate
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Task Library */}
        <aside className="w-72 border-r border-gray-700 bg-gray-800/30 flex-shrink-0">
          <TaskLibrary onViewTask={handleViewTask} onAddTask={handleAddTask} />
        </aside>

        {/* Center - Workflow Canvas */}
        <main className="flex-1 relative">
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
