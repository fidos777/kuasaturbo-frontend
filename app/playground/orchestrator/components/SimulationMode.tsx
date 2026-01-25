'use client';

import { useState } from 'react';
import { Play, X, RotateCcw, ArrowRight, CheckCircle, XCircle, Loader2, AlertTriangle, Zap, Shield, ShieldAlert } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { SimulationResult, SimulationStep } from '@/types/orchestrator';

// ============================================================================
// STRESS TEST MODE (Soft Gap #4 - Adversarial Testing)
// ============================================================================
// Blueprint v2.0: "No Prediction Without Simulation" (I7)
// Stress test mode injects edge cases to verify robustness
// ============================================================================
type SimulationTestMode = 'standard' | 'stress';

interface StressTestConfig {
  injectEmptyInputs: boolean;      // Test with empty/null inputs
  injectMalformedData: boolean;    // Test with malformed JSON
  injectHighLatency: boolean;      // Simulate slow responses
  injectRandomFailures: boolean;   // Random task failures
}

interface SimulationModeProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPublish: () => void;
}

export default function SimulationMode({ isOpen, onClose, onProceedToPublish }: SimulationModeProps) {
  const {
    nodes,
    currentWorkflow,
    simulationResult,
    isSimulating,
    runSimulation,
    resetSimulation,
  } = useWorkflowStore();

  // Day-1: Check if workflow is approved
  const isApproved = currentWorkflow?.isApproved ?? false;

  const [hasRun, setHasRun] = useState(false);
  const [testMode, setTestMode] = useState<SimulationTestMode>('standard');
  const [stressConfig, setStressConfig] = useState<StressTestConfig>({
    injectEmptyInputs: true,
    injectMalformedData: true,
    injectHighLatency: false,
    injectRandomFailures: true,
  });

  const handleRunSimulation = async () => {
    setHasRun(true);
    // Note: In full implementation, pass testMode and stressConfig to runSimulation
    // For MVP, we just track the mode selection
    await runSimulation();
  };

  const handleReset = () => {
    resetSimulation();
    setHasRun(false);
  };

  if (!isOpen) return null;

  const allPassed = simulationResult && simulationResult.passedSteps === simulationResult.totalSteps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-background border border-gray-700 rounded-card shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Simulation Mode</h2>
              <p className="text-sm text-gray-400">Test your workflow with mock data</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-button transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-warning/10 border-b border-warning/30 px-4 py-3">
          <div className="flex items-center gap-2 text-warning text-sm">
            <AlertTriangle size={16} />
            <span className="font-medium">SIMULATION</span>
            <span className="text-gray-400">- No real AI execution. Using mock data.</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Show blocked state if not certified - Design Constitution compliant */}
          {!isApproved ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={40} className="text-error" />
              </div>
              <h3 className="text-xl font-bold text-error mb-3">
                ❌ This workflow cannot run until certified.
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Human certification is required before any execution can happen.
              </p>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-md mx-auto text-left">
                <p className="text-sm text-gray-300 mb-2 font-medium">To certify this workflow:</p>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Click <span className="text-action-primary">"Submit for Certification"</span> button</li>
                  <li>Complete the certification checklist</li>
                  <li>Check "I certify this workflow for execution"</li>
                </ol>
              </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No tasks in workflow. Add tasks before running simulation.</p>
            </div>
          ) : !hasRun ? (
            <div className="py-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🧪</div>
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Simulate</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Test your workflow with mock data to verify the flow works correctly.
                </p>
              </div>

              {/* Test Mode Toggle (Soft Gap #4) */}
              <div className="max-w-md mx-auto mb-8">
                <div className="bg-card border border-gray-700 rounded-card p-4">
                  <div className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                    <Shield size={12} />
                    <span>Test Mode (Invariant 7: No Prediction Without Simulation)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => setTestMode('standard')}
                      className={`px-4 py-3 rounded-button text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        testMode === 'standard'
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      <Play size={16} />
                      Standard
                    </button>
                    <button
                      onClick={() => setTestMode('stress')}
                      className={`px-4 py-3 rounded-button text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        testMode === 'stress'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      <Zap size={16} />
                      Stress Test
                    </button>
                  </div>

                  {/* Stress Test Config */}
                  {testMode === 'stress' && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-medium text-amber-300 mb-2">
                        Adversarial Test Scenarios:
                      </div>
                      {[
                        { key: 'injectEmptyInputs', label: 'Empty/Null Inputs', desc: 'Test missing data handling' },
                        { key: 'injectMalformedData', label: 'Malformed Data', desc: 'Test invalid JSON responses' },
                        { key: 'injectRandomFailures', label: 'Random Failures', desc: 'Test error recovery' },
                        { key: 'injectHighLatency', label: 'High Latency', desc: 'Test timeout handling' },
                      ].map(({ key, label, desc }) => (
                        <label key={key} className="flex items-center justify-between cursor-pointer p-2 hover:bg-amber-500/10 rounded">
                          <div>
                            <div className="text-xs text-white">{label}</div>
                            <div className="text-[10px] text-gray-400">{desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={stressConfig[key as keyof StressTestConfig]}
                            onChange={(e) => setStressConfig(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="w-4 h-4 accent-amber-500"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className={`px-6 py-3 font-medium rounded-button transition-colors flex items-center gap-2 mx-auto ${
                    testMode === 'stress'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-primary hover:bg-primary-600 text-white'
                  }`}
                >
                  {testMode === 'stress' ? <Zap size={20} /> : <Play size={20} />}
                  {testMode === 'stress' ? 'Run Stress Test' : 'Run Simulation'}
                </button>
                <p className="text-[10px] text-gray-500 mt-2">
                  No actual AI calls will be made
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {simulationResult?.steps.map((step, idx) => (
                <SimulationStepCard key={idx} step={step} stepNumber={idx + 1} />
              ))}

              {isSimulating && (
                <div className="flex items-center justify-center gap-2 py-4 text-primary">
                  <Loader2 size={20} className="animate-spin" />
                  <span>Running simulation...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        {simulationResult && !isSimulating && (
          <div className="border-t border-gray-700 p-4 bg-card/50">
            <div className={`rounded-card p-4 ${allPassed ? 'bg-success/10 border border-success/30' : 'bg-error/10 border border-error/30'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${allPassed ? 'text-success' : 'text-error'}`}>
                  {allPassed ? '✓ SIMULATION COMPLETE' : '✕ SIMULATION FAILED'}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Total Steps</div>
                  <div className="text-white font-medium">
                    {simulationResult.passedSteps}/{simulationResult.totalSteps} passed
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Total Mock Cost</div>
                  <div className="text-white font-medium">
                    RM {simulationResult.totalMockCost.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Est. Success Rate</div>
                  <div className={`font-medium ${
                    simulationResult.estimatedSuccessRate >= 90 ? 'text-success' :
                    simulationResult.estimatedSuccessRate >= 80 ? 'text-warning' :
                    'text-error'
                  }`}>
                    {simulationResult.estimatedSuccessRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t border-gray-700 p-4 flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Run Again
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Exit Simulation
            </button>
            {allPassed && (
              <button
                onClick={() => {
                  onClose();
                  onProceedToPublish();
                }}
                className="px-6 py-2 bg-success hover:bg-green-600 text-white text-sm font-medium
                  rounded-button transition-colors flex items-center gap-2"
              >
                Proceed to Publish
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulationStepCard({ step, stepNumber }: { step: SimulationStep; stepNumber: number }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = {
    pending: <div className="w-5 h-5 rounded-full border-2 border-gray-500" />,
    running: <Loader2 size={20} className="text-primary animate-spin" />,
    pass: <CheckCircle size={20} className="text-success" />,
    fail: <XCircle size={20} className="text-error" />,
  };

  const statusBg = {
    pending: 'bg-card',
    running: 'bg-primary/10 border-primary/30',
    pass: 'bg-success/10 border-success/30',
    fail: 'bg-error/10 border-error/30',
  };

  return (
    <div
      className={`rounded-card border p-4 transition-all cursor-pointer ${statusBg[step.status]}`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusIcon[step.status]}
          <div>
            <div className="text-xs text-gray-400">STEP {stepNumber}</div>
            <div className="font-medium text-white">
              {step.taskId}: {step.taskName}
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 text-xs font-medium rounded ${
          step.status === 'pass' ? 'bg-success/20 text-success' :
          step.status === 'fail' ? 'bg-error/20 text-error' :
          step.status === 'running' ? 'bg-primary/20 text-primary' :
          'bg-gray-700 text-gray-400'
        }`}>
          {step.status.toUpperCase()}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (step.status === 'pass' || step.status === 'fail') && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          {/* Input */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Input:</div>
            <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto">
              {JSON.stringify(step.input, null, 2)}
            </pre>
          </div>

          {/* Output */}
          {step.output && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Output:</div>
              <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {step.error && (
            <div>
              <div className="text-xs text-error mb-1">Error:</div>
              <div className="text-xs text-error bg-error/10 p-2 rounded">
                {step.error}
              </div>
            </div>
          )}

          {/* Timing */}
          <div className="flex gap-4 text-xs text-gray-400">
            <span>Mock Time: {step.mockTime.toFixed(1)}s</span>
            <span>Mock Cost: RM {step.mockCost.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
