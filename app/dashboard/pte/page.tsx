'use client';

// ============================================================================
// PTE DASHBOARD PAGE
// Sprint 4: PTE Module - Proof-Time Execution with audit trail
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// Invariant I5: "No Silence Without Signal" — Every interaction produces a trace
// ============================================================================

import { useEffect, useState } from 'react';
import {
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Play,
  RefreshCw,
  BarChart3,
  Link2,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { usePTEStore } from '@/store/pteStore';
import { ExecutionProof, AuditTrailViewer, ProofTimeline } from '@/app/components/pte';
import { CreditBalance } from '@/app/components/credits';
import { useCreditStore } from '@/store/creditStore';
import {
  ExecutionResult,
  PTEProof,
  AuditTrail,
  getPhaseDisplayName,
  getProofTypeDisplayName,
} from '@/types/pte';
import { MalaysianSector, MALAYSIAN_SECTORS } from '@/types/qpi';

export default function PTEDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'executions' | 'proofs' | 'audit'>('overview');
  const [selectedResult, setSelectedResult] = useState<ExecutionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // PTE Store
  const {
    stats,
    completedResults,
    proofs,
    auditTrails,
    selectedContextId,
    initializeDemo,
    simulateExecution,
    selectContext,
    verifyProof,
    getProofChain,
    getAuditTrail,
  } = usePTEStore();

  // Credit Store
  const initializeBalance = useCreditStore((state) => state.initializeBalance);

  // Initialize on mount
  useEffect(() => {
    initializeDemo();
    initializeBalance('demo-tenant-001', 'Demo User');
  }, [initializeDemo, initializeBalance]);

  // Handle simulate execution
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const sectors: MalaysianSector[] = ['technology', 'finance', 'retail', 'healthcare'];
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const result = await simulateExecution(`wf-sim-${Date.now()}`, sector);
      setSelectedResult(result);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  // Get selected context's proofs and audit trail
  const selectedProofs = selectedResult ? selectedResult.proofs : [];
  const selectedAuditTrail = selectedResult
    ? getAuditTrail(selectedResult.contextId)
    : undefined;

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-500" />
                <h1 className="text-xl font-bold">PTE Dashboard</h1>
              </div>
              <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                Proof-Time Execution
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Credit Balance */}
              <CreditBalance variant="compact" showTopUp />

              <div className="h-6 w-px bg-gray-700" />

              {/* Simulate button */}
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg transition-colors"
              >
                {isSimulating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isSimulating ? 'Simulating...' : 'Simulate Execution'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'executions', label: 'Executions', icon: Activity },
              { id: 'proofs', label: 'Proof Chains', icon: Link2 },
              { id: 'audit', label: 'Audit Trail', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Executions</span>
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div className="mt-2 text-3xl font-bold">{stats.totalExecutions}</div>
                <div className="mt-1 text-xs text-gray-500">All time</div>
              </div>

              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Success Rate</span>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="mt-2 text-3xl font-bold text-green-400">
                  {stats.totalExecutions > 0
                    ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100)
                    : 0}
                  %
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {stats.successfulExecutions} / {stats.totalExecutions}
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Proofs Generated</span>
                  <Link2 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="mt-2 text-3xl font-bold">{stats.totalProofsGenerated}</div>
                <div className="mt-1 text-xs text-gray-500">Verified claims</div>
              </div>

              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Avg Duration</span>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="mt-2 text-3xl font-bold">
                  {formatDuration(stats.averageExecutionMs)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {stats.totalCreditsConsumed} credits consumed
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Recent Executions */}
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Recent Executions</h3>
                  <span className="text-xs text-gray-400">
                    {completedResults.length} total
                  </span>
                </div>

                <div className="space-y-2">
                  {completedResults.slice(0, 5).map((result) => (
                    <button
                      key={result.contextId}
                      onClick={() => {
                        setSelectedResult(result);
                        setActiveTab('proofs');
                      }}
                      className="w-full p-3 bg-gray-900/50 hover:bg-gray-900/80 rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-sm text-white font-mono">
                            {result.contextId.slice(0, 16)}...
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                        <span>{result.proofs.length} proofs</span>
                        <span>•</span>
                        <span>{formatDuration(result.durationMs)}</span>
                        <span>•</span>
                        <span>{result.metrics.creditsUsed} credits</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Proof Chain Preview */}
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <h3 className="text-sm font-medium text-white mb-4">
                  {selectedResult ? 'Selected Execution' : 'Latest Proof Chain'}
                </h3>

                {(selectedResult || completedResults[0]) && (
                  <ProofTimeline
                    proofs={(selectedResult || completedResults[0]).proofs}
                    variant="compact"
                    showChainStatus={true}
                  />
                )}
              </div>
            </div>

            {/* Execution by Status */}
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
              <h3 className="text-sm font-medium text-white mb-4">Execution Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {stats.successfulExecutions}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Successful</div>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {stats.failedExecutions}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Failed</div>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {stats.totalProofsGenerated}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Proofs Generated</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Executions Tab */}
        {activeTab === 'executions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Execution History</h2>
              <span className="text-sm text-gray-400">
                {completedResults.length} executions
              </span>
            </div>

            <div className="space-y-3">
              {completedResults.map((result) => (
                <div
                  key={result.contextId}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedResult?.contextId === result.contextId
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-mono text-white">{result.contextId}</span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            result.success
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Link2 className="w-4 h-4" />
                          {result.proofs.length} proofs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(result.durationMs)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {result.metrics.creditsUsed} credits
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>{new Date(result.completedAt).toLocaleDateString()}</div>
                      <div>
                        {new Date(result.completedAt).toLocaleTimeString('en-MY', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Proof chain preview */}
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-1">
                      {result.proofs.slice(0, 5).map((proof, index) => (
                        <div key={proof.id} className="flex items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              proof.type === 'execution_complete'
                                ? 'bg-green-500/20 text-green-400'
                                : proof.type === 'execution_failed'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {index + 1}
                          </div>
                          {index < Math.min(result.proofs.length, 5) - 1 && (
                            <div className="w-2 h-0.5 bg-gray-600" />
                          )}
                        </div>
                      ))}
                      {result.proofs.length > 5 && (
                        <span className="text-xs text-gray-500 ml-2">
                          +{result.proofs.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Errors if any */}
                  {result.errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="flex items-center gap-2 text-sm text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        {result.errors[0].message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proofs Tab */}
        {activeTab === 'proofs' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Execution selector */}
            <div className="col-span-1 space-y-4">
              <h3 className="text-sm font-medium text-white">Select Execution</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {completedResults.map((result) => (
                  <button
                    key={result.contextId}
                    onClick={() => setSelectedResult(result)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedResult?.contextId === result.contextId
                        ? 'bg-purple-500/20 border border-purple-500'
                        : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm font-mono text-white">
                        {result.contextId.slice(0, 12)}...
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {result.proofs.length} proofs • {formatDuration(result.durationMs)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Proof chain view */}
            <div className="col-span-2">
              {selectedResult ? (
                <div className="space-y-6">
                  {/* Timeline */}
                  <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                    <ProofTimeline
                      proofs={selectedResult.proofs}
                      variant="horizontal"
                      showChainStatus={true}
                    />
                  </div>

                  {/* Proof list */}
                  <div className="space-y-4">
                    {selectedResult.proofs.map((proof, index) => (
                      <ExecutionProof
                        key={proof.id}
                        proof={proof}
                        isFirst={index === 0}
                        isLast={index === selectedResult.proofs.length - 1}
                        onVerify={verifyProof}
                        variant="full"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 bg-gray-800/50 border border-gray-700 rounded-xl text-center text-gray-400">
                  <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select an execution to view its proof chain</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Execution selector */}
            <div className="col-span-1 space-y-4">
              <h3 className="text-sm font-medium text-white">Select Execution</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {completedResults.map((result) => {
                  const trail = getAuditTrail(result.contextId);
                  return (
                    <button
                      key={result.contextId}
                      onClick={() => setSelectedResult(result)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedResult?.contextId === result.contextId
                          ? 'bg-purple-500/20 border border-purple-500'
                          : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-mono text-white">
                          {result.contextId.slice(0, 12)}...
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {trail?.eventCount || 0} events
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audit trail view */}
            <div className="col-span-2">
              {selectedResult && selectedAuditTrail ? (
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                  <AuditTrailViewer trail={selectedAuditTrail} variant="full" />
                </div>
              ) : (
                <div className="p-12 bg-gray-800/50 border border-gray-700 rounded-xl text-center text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select an execution to view its audit trail</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              Invariant I2: &quot;No Profit Without Proof&quot; — Every claim must be backed
            </span>
            <span>
              Invariant I5: &quot;No Silence Without Signal&quot; — Every interaction produces a trace
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
