/**
 * Verification Studio Dashboard
 *
 * Sprint 6: Unified verification dashboard combining:
 * - Proof Explorer (from PTE)
 * - Invariant Checker (from PIL)
 * - Trust Index (from QPI)
 *
 * Sprint 6.5: Decision Accountability
 * - Decision Log (audit trail of human justifications)
 *
 * Philosophy: "Math makes AI trustworthy"
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePILStore } from '../../../store/pilStore';
import { usePTEStore } from '../../../store/pteStore';
import { useQPIStore } from '../../../store/qpiStore';
import { useCreditStore } from '../../../store/creditStore';
import { useDecisionStore } from '../../../store/decisionStore';
import type { InvariantId, EnforcementMode, PILContext, GateType } from '../../../types/pil';
import type { PTEProof, AuditEvent } from '../../../types/pte';
import { THE_SEVEN_INVARIANTS, getInvariantColor, getEnforcementIcon } from '../../../types/pil';
import { DecisionLogViewer, DecisionJustificationPanel } from '../../../components/decision';

// ============================================================================
// TAB TYPES
// ============================================================================

type TabType = 'proofs' | 'invariants' | 'trust' | 'simulator' | 'decisions';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VerificationStudioDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('invariants');

  // Store hooks
  const pilStore = usePILStore();
  const pteStore = usePTEStore();
  const qpiStore = useQPIStore();
  const creditStore = useCreditStore();
  const decisionStore = useDecisionStore();

  // Fetch data on mount
  useEffect(() => {
    qpiStore.refreshQPIData();
  }, [qpiStore]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'proofs', label: 'Proof Explorer', icon: '📜' },
    { id: 'invariants', label: 'Invariant Checker', icon: '⚖️' },
    { id: 'trust', label: 'Trust Index', icon: '📊' },
    { id: 'simulator', label: 'Governance Simulator', icon: '🧪' },
    { id: 'decisions', label: 'Decision Log', icon: '✍️' },
  ];

  // Calculate summary stats
  const totalProofs = pteStore.stats.totalProofsGenerated;
  const enabledInvariants = Object.values(pilStore.invariants).filter(
    (i) => i.enabled
  ).length;
  const blockingInvariants = Object.values(pilStore.invariants).filter(
    (i) => i.enabled && i.enforcementMode === 'block'
  ).length;
  const avgTrustScore = qpiStore.globalTimeSeries.length > 0
    ? qpiStore.globalTimeSeries[qpiStore.globalTimeSeries.length - 1].score
    : 0;
  const totalDecisions = decisionStore.decisions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Verification Studio
              </h1>
              <p className="mt-2 text-indigo-100">
                Unified governance verification — "Math makes AI trustworthy"
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-white">
                  {totalProofs}
                </span>
                <span className="text-sm text-indigo-200 ml-1">Proofs</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-white">
                  {enabledInvariants}/7
                </span>
                <span className="text-sm text-indigo-200 ml-1">Invariants</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-white">
                  {Math.round(avgTrustScore)}%
                </span>
                <span className="text-sm text-indigo-200 ml-1">Trust</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-white">
                  {totalDecisions}
                </span>
                <span className="text-sm text-indigo-200 ml-1">Decisions</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'proofs' && (
          <ProofsTab
            completedResults={pteStore.completedResults}
            getProofChain={pteStore.getProofChain}
          />
        )}
        {activeTab === 'invariants' && (
          <InvariantsTab
            invariants={pilStore.invariants}
            setEnabled={pilStore.setInvariantEnabled}
            setMode={pilStore.setEnforcementMode}
            checkAll={pilStore.checkAllInvariants}
            lastValidation={pilStore.lastValidation}
          />
        )}
        {activeTab === 'trust' && (
          <TrustTab
            sectorScores={qpiStore.sectorScores}
            trustGaps={qpiStore.trustGaps}
            timeSeries={qpiStore.globalTimeSeries}
          />
        )}
        {activeTab === 'simulator' && (
          <SimulatorTab
            checkAllInvariants={pilStore.checkAllInvariants}
            evaluateGate={pilStore.evaluateGate}
            calculateTrustScore={pilStore.calculateTrustScore}
            checkCredits={creditStore.checkCredits}
          />
        )}
        {activeTab === 'decisions' && (
          <DecisionsTab />
        )}
      </div>

      {/* Decision Justification Panel (Modal) */}
      <DecisionJustificationPanel />
    </div>
  );
}

// ============================================================================
// PROOFS TAB (from PTE)
// ============================================================================

interface ProofsTabProps {
  completedResults: any[];
  getProofChain: (contextId: string) => PTEProof[];
}

function ProofsTab({ completedResults, getProofChain }: ProofsTabProps) {
  const [selectedContext, setSelectedContext] = useState<string | null>(null);

  const typeColors: Record<string, string> = {
    execution_start: '#3b82f6',
    checkpoint: '#10b981',
    execution_complete: '#8b5cf6',
    execution_failed: '#ef4444',
    rollback: '#f59e0b',
    verification: '#06b6d4',
    attestation: '#ec4899',
  };

  const proofs = selectedContext ? getProofChain(selectedContext) : [];

  return (
    <div className="space-y-6">
      {/* Execution Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <label className="block text-sm text-gray-500 mb-2">
          Select Execution Context
        </label>
        <div className="flex flex-wrap gap-2">
          {completedResults.slice(0, 10).map((result) => (
            <button
              key={result.contextId}
              onClick={() => setSelectedContext(result.contextId)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedContext === result.contextId
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {result.contextId.slice(0, 15)}...
            </button>
          ))}
          {completedResults.length === 0 && (
            <p className="text-sm text-gray-400">
              No completed executions yet. Run a workflow to generate proofs.
            </p>
          )}
        </div>
      </div>

      {/* Proof Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Proof Chain ({proofs.length} entries)
          </h3>
        </div>

        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {proofs.map((proof, index) => (
            <div key={proof.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: typeColors[proof.type] || '#6b7280' }}
                  />
                  {index < proofs.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 text-xs font-medium rounded"
                      style={{
                        backgroundColor: `${typeColors[proof.type]}20`,
                        color: typeColors[proof.type],
                      }}
                    >
                      {proof.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {proof.generatedAt}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      #{proof.sequenceNumber}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-900">
                    Phase: {proof.phase}
                  </p>

                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-mono">{proof.proofHash?.slice(0, 16)}...</span>
                    {proof.verified && (
                      <span className="text-green-600">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {proofs.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              {selectedContext
                ? 'No proofs found for this context'
                : 'Select an execution context to view its proof chain'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INVARIANTS TAB (from PIL)
// ============================================================================

interface InvariantsTabProps {
  invariants: Record<InvariantId, any>;
  setEnabled: (id: InvariantId, enabled: boolean) => void;
  setMode: (id: InvariantId, mode: EnforcementMode) => void;
  checkAll: (context: PILContext) => any;
  lastValidation: any;
}

function InvariantsTab({
  invariants,
  setEnabled,
  setMode,
  checkAll,
  lastValidation,
}: InvariantsTabProps) {
  const [testContext, setTestContext] = useState<PILContext>({
    authority_signature: 'sig_test',
    proof_hash: 'hash_test',
    audit_trail: true,
    credit_balance: 100,
    execution_cost: 10,
    consequence_log: true,
    proof_of_logic: true,
    simulation_proof: true,
  });

  const handleValidate = useCallback(() => {
    checkAll(testContext);
  }, [checkAll, testContext]);

  const invariantIds = Object.keys(invariants) as InvariantId[];

  return (
    <div className="space-y-6">
      {/* Quick Test */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Quick Invariant Test
          </h3>
          <button
            onClick={handleValidate}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Run All Checks
          </button>
        </div>

        {lastValidation && (
          <div
            className={`p-4 rounded-lg ${
              lastValidation.passed
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {lastValidation.passed ? '✅' : '❌'}
              </span>
              <span
                className={`text-lg font-bold ${
                  lastValidation.passed ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {lastValidation.score}% Pass Rate
              </span>
            </div>
            {lastValidation.failedInvariants.length > 0 && (
              <p className="mt-2 text-sm text-red-600">
                Failed: {lastValidation.failedInvariants.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Invariant Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {invariantIds.map((id) => {
          const inv = invariants[id];
          const result = lastValidation?.results.find(
            (r: any) => r.invariantId === id
          );

          return (
            <div
              key={id}
              className={`bg-white rounded-xl border-2 p-4 shadow-sm transition-all ${
                inv.enabled
                  ? result?.passed === false
                    ? 'border-red-300'
                    : result?.passed === true
                    ? 'border-green-300'
                    : 'border-gray-200'
                  : 'border-gray-100 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-2 py-1 text-xs font-bold rounded"
                  style={{
                    backgroundColor: `${getInvariantColor(inv.category)}20`,
                    color: getInvariantColor(inv.category),
                  }}
                >
                  {id}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inv.enabled}
                    onChange={(e) => setEnabled(id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>

              {/* Name */}
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {inv.name}
              </h4>

              {/* Expression */}
              <div className="bg-gray-900 rounded px-2 py-1 mb-2">
                <code className="text-[10px] text-green-400 font-mono">
                  {inv.expression}
                </code>
              </div>

              {/* Enforcement Mode */}
              <div className="flex gap-1">
                {(['block', 'warn', 'log'] as EnforcementMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMode(id, mode)}
                    disabled={!inv.enabled}
                    className={`flex-1 px-1.5 py-1 text-[10px] rounded transition-colors ${
                      inv.enforcementMode === mode
                        ? mode === 'block'
                          ? 'bg-red-100 text-red-700'
                          : mode === 'warn'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                    } ${!inv.enabled && 'opacity-50'}`}
                  >
                    {getEnforcementIcon(mode)}
                  </button>
                ))}
              </div>

              {/* Result indicator */}
              {result && (
                <div className="mt-2 text-xs">
                  {result.passed ? (
                    <span className="text-green-600">✓ Passed</span>
                  ) : (
                    <span className="text-red-600">✗ {result.reason}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TRUST TAB (from QPI)
// ============================================================================

interface TrustTabProps {
  sectorScores: any[];
  trustGaps: any[];
  timeSeries: any[];
}

function TrustTab({ sectorScores, trustGaps, timeSeries }: TrustTabProps) {
  const avgScore =
    sectorScores.length > 0
      ? Math.round(
          sectorScores.reduce((sum, s) => sum + s.trustScore, 0) /
            sectorScores.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Global Trust Score</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{avgScore}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Sectors Monitored</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {sectorScores.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Trust Gaps</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">
            {trustGaps.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Data Points</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {timeSeries.length}
          </p>
        </div>
      </div>

      {/* Sector Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sector Trust Scores
        </h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sectorScores.map((sector) => (
            <div
              key={sector.sectorId}
              className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {sector.sectorName}
                </span>
                <span
                  className={`text-sm font-bold ${
                    sector.trustScore >= 80
                      ? 'text-green-600'
                      : sector.trustScore >= 60
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {Math.round(sector.trustScore)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    sector.trustScore >= 80
                      ? 'bg-green-500'
                      : sector.trustScore >= 60
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${sector.trustScore}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{sector.proofCount} proofs</span>
                <span>Level {sector.verificationLevel}</span>
              </div>
            </div>
          ))}

          {sectorScores.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-400">
              No sector data available. Initialize QPI to see trust scores.
            </div>
          )}
        </div>
      </div>

      {/* Trust Gaps */}
      {trustGaps.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trust Gaps ({trustGaps.length})
          </h3>
          <div className="space-y-3">
            {trustGaps.slice(0, 5).map((gap, i) => (
              <div
                key={i}
                className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-amber-900">
                    {gap.sectorName}
                  </span>
                  <span className="text-sm text-amber-700">
                    Gap: {gap.gap}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-amber-600">
                  {gap.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SIMULATOR TAB
// ============================================================================

interface SimulatorTabProps {
  checkAllInvariants: (context: PILContext) => any;
  evaluateGate: (type: GateType, context: PILContext) => any;
  calculateTrustScore: (context: PILContext) => number;
  checkCredits: (amount: number) => any;
}

function SimulatorTab({
  checkAllInvariants,
  evaluateGate,
  calculateTrustScore,
  checkCredits,
}: SimulatorTabProps) {
  const [context, setContext] = useState<PILContext>({
    authority_signature: 'sig_test',
    proof_hash: 'hash_test',
    audit_trail: true,
    credit_balance: 100,
    execution_cost: 10,
    consequence_log: true,
    proof_of_logic: true,
    simulation_proof: true,
    confidence: 0.85,
    risk_score: 0.3,
    proof_depth: 3,
    verification_confidence: 0.9,
    simulation_validity: 1.0,
  });

  const [results, setResults] = useState<{
    invariants: any;
    gates: any[];
    trustScore: number;
    credits: any;
    recommendation: string;
  } | null>(null);

  const handleSimulate = useCallback(() => {
    const invariants = checkAllInvariants(context);
    const gates: GateType[] = ['Type_A', 'Type_B', 'Type_C', 'Type_Z'];
    const gateResults = gates.map((g) => evaluateGate(g, context));
    const trustScore = calculateTrustScore(context);
    const credits = checkCredits((context.execution_cost as number) || 0);

    // Determine recommendation
    let recommendation = 'PROCEED';
    if (!invariants.passed) {
      recommendation = 'BLOCK - Invariants failed';
    } else if (!credits.can_execute) {
      recommendation = 'BLOCK - Insufficient credits';
    } else if (gateResults.find((g) => g.action === 'block')?.triggered) {
      recommendation = 'BLOCK - Gate blocked';
    } else if ((context.risk_score as number) > 0.7) {
      recommendation = 'ESCALATE - High risk score';
    } else if ((context.confidence as number) < 0.9) {
      recommendation = 'HUMAN CONFIRM - Confidence below threshold';
    }

    setResults({
      invariants,
      gates: gateResults,
      trustScore,
      credits,
      recommendation,
    });
  }, [context, checkAllInvariants, evaluateGate, calculateTrustScore, checkCredits]);

  return (
    <div className="space-y-6">
      {/* Context Editor */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Simulation Context
          </h3>
          <textarea
            value={JSON.stringify(context, null, 2)}
            onChange={(e) => {
              try {
                setContext(JSON.parse(e.target.value));
              } catch {
                // Ignore parse errors
              }
            }}
            className="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50"
          />
          <button
            onClick={handleSimulate}
            className="mt-4 w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            🚀 Run Governance Simulation
          </button>
        </div>

        {/* Quick Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Adjustments
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Confidence: {((context.confidence as number) * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={(context.confidence as number) * 100}
                onChange={(e) =>
                  setContext((prev) => ({
                    ...prev,
                    confidence: parseInt(e.target.value) / 100,
                  }))
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Risk Score: {((context.risk_score as number) * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={(context.risk_score as number) * 100}
                onChange={(e) =>
                  setContext((prev) => ({
                    ...prev,
                    risk_score: parseInt(e.target.value) / 100,
                  }))
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Credit Balance: {context.credit_balance}
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={context.credit_balance as number}
                onChange={(e) =>
                  setContext((prev) => ({
                    ...prev,
                    credit_balance: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Execution Cost: {context.execution_cost}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={context.execution_cost as number}
                onChange={(e) =>
                  setContext((prev) => ({
                    ...prev,
                    execution_cost: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Recommendation Banner */}
          <div
            className={`rounded-xl p-6 ${
              results.recommendation.startsWith('PROCEED')
                ? 'bg-green-100 border-2 border-green-300'
                : results.recommendation.startsWith('BLOCK')
                ? 'bg-red-100 border-2 border-red-300'
                : 'bg-amber-100 border-2 border-amber-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">
                {results.recommendation.startsWith('PROCEED')
                  ? '✅'
                  : results.recommendation.startsWith('BLOCK')
                  ? '🛑'
                  : '⚠️'}
              </span>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {results.recommendation}
                </p>
                <p className="text-sm text-gray-600">
                  Trust Score: {(results.trustScore * 100).toFixed(0)}% |
                  Invariants: {results.invariants.score}% |
                  Credits: {results.credits.can_execute ? 'OK' : 'Insufficient'}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Results Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Invariants */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Invariant Results
              </h4>
              <div className="space-y-2">
                {results.invariants.results.map((r: any) => (
                  <div
                    key={r.invariantId}
                    className={`flex items-center justify-between px-3 py-2 rounded ${
                      r.passed ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{r.invariantId}</span>
                    <span>{r.passed ? '✅' : '❌'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gates */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Gate Evaluation
              </h4>
              <div className="space-y-2">
                {results.gates.map((g: any) => (
                  <div
                    key={g.gate}
                    className={`flex items-center justify-between px-3 py-2 rounded ${
                      g.triggered
                        ? g.action === 'block'
                          ? 'bg-red-50'
                          : g.action === 'auto_approve'
                          ? 'bg-green-50'
                          : 'bg-amber-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{g.gate}</span>
                    <span className="text-xs">
                      {g.triggered ? g.action : 'Not triggered'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Computed Metrics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trust Score</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {(results.trustScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Invariant Pass</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {results.invariants.score}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Credit Check</span>
                  <span
                    className={`text-lg font-bold ${
                      results.credits.can_execute
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {results.credits.can_execute ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DECISIONS TAB (Sprint 6.5)
// ============================================================================

function DecisionsTab() {
  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">✍️</span>
          <div>
            <h3 className="text-lg font-semibold text-amber-900">
              Decision Accountability Layer
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              "Menjadikan certification act of liability" — Every governance decision
              requires human justification with proof chain linkage. This creates
              tamper-evident audit trails that regulators love.
            </p>
          </div>
        </div>
      </div>

      {/* Decision Log Viewer */}
      <DecisionLogViewer />
    </div>
  );
}
