/**
 * PIL Dashboard - Prompt Invariant Language
 *
 * Main dashboard for viewing, editing, and validating PIL constraints.
 * Part of Sprint 5: PIL Framework
 *
 * Philosophy: "Math makes AI trustworthy"
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePILStore } from '../../../store/pilStore';
import type {
  InvariantId,
  Invariant,
  EnforcementMode,
  PILContext,
  WorkflowState,
  GateType,
} from '../../../types/pil';
import {
  THE_SEVEN_INVARIANTS,
  VALID_TRANSITIONS,
  GATES,
  getInvariantColor,
  getSeverityColor,
  getEnforcementIcon,
  getStateColor,
} from '../../../types/pil';

// ============================================================================
// TAB TYPES
// ============================================================================

type TabType = 'editor' | 'invariants' | 'transitions' | 'validation';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PILDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('invariants');

  const {
    invariants,
    statements,
    parseErrors,
    lastValidation,
    editorContent,
    setInvariantEnabled,
    setEnforcementMode,
    parseStatements,
    checkAllInvariants,
    validateTransition,
    evaluateGate,
    calculateTrustScore,
    calculateProofDelta,
    setEditorContent,
  } = usePILStore();

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'editor', label: 'Editor', icon: '📝' },
    { id: 'invariants', label: '7 Invariants', icon: '⚖️' },
    { id: 'transitions', label: 'Transitions', icon: '🔄' },
    { id: 'validation', label: 'Validation', icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PIL Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Prompt Invariant Language — "Math makes AI trustworthy"
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastValidation && (
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    lastValidation.passed
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {lastValidation.passed ? '✅' : '❌'} {lastValidation.score}%
                  Invariants
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200 -mb-px'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
        {activeTab === 'editor' && (
          <EditorTab
            content={editorContent}
            setContent={setEditorContent}
            parseStatements={parseStatements}
            statements={statements}
            parseErrors={parseErrors}
          />
        )}
        {activeTab === 'invariants' && (
          <InvariantsTab
            invariants={invariants}
            setEnabled={setInvariantEnabled}
            setMode={setEnforcementMode}
          />
        )}
        {activeTab === 'transitions' && (
          <TransitionsTab validateTransition={validateTransition} />
        )}
        {activeTab === 'validation' && (
          <ValidationTab
            checkAllInvariants={checkAllInvariants}
            evaluateGate={evaluateGate}
            calculateTrustScore={calculateTrustScore}
            calculateProofDelta={calculateProofDelta}
            lastValidation={lastValidation}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EDITOR TAB
// ============================================================================

interface EditorTabProps {
  content: string;
  setContent: (content: string) => void;
  parseStatements: (content: string) => any[];
  statements: any[];
  parseErrors: string[];
}

function EditorTab({
  content,
  setContent,
  parseStatements,
  statements,
  parseErrors,
}: EditorTabProps) {
  const [localContent, setLocalContent] = useState(content);

  const handleParse = useCallback(() => {
    setContent(localContent);
    parseStatements(localContent);
  }, [localContent, setContent, parseStatements]);

  const templates = [
    {
      label: 'Invariant',
      code: 'INVARIANT name REQUIRE condition FOR scope',
    },
    {
      label: 'Constraint',
      code: 'CONSTRAINT proof_delta <= 0.1 FOR Type_A_workflow',
    },
    {
      label: 'Transition',
      code: 'TRANSITION draft -> tested REQUIRES test_coverage >= 0.8',
    },
    {
      label: 'Gate',
      code: 'GATE Type_A WHEN confidence >= 0.9 THEN auto_approve',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Insert Template
        </h3>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.label}
              onClick={() =>
                setLocalContent((prev) => prev + (prev ? '\n' : '') + t.code)
              }
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">PIL Editor</h3>
          </div>
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder={`// Enter PIL statements here\n// Example:\nINVARIANT authority REQUIRE signature FOR action\nCONSTRAINT proof_delta <= 0.1 FOR Type_A_workflow\nTRANSITION draft -> tested REQUIRES test_coverage >= 0.8`}
            className="w-full h-96 p-4 font-mono text-sm text-gray-800 bg-gray-900 text-green-400 resize-none focus:outline-none"
            style={{ background: '#1a1a2e', color: '#00ff88' }}
          />
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {localContent.split('\n').filter((l) => l.trim()).length} lines
            </span>
            <button
              onClick={handleParse}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Parse & Validate
            </button>
          </div>
        </div>

        {/* Parse Results */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">Parse Results</h3>
          </div>
          <div className="p-4 h-96 overflow-auto">
            {parseErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  ⚠️ Parse Errors
                </h4>
                <ul className="text-xs text-red-600 space-y-1">
                  {parseErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {statements.length > 0 ? (
              <div className="space-y-2">
                {statements.map((stmt, i) => (
                  <div
                    key={stmt.id || i}
                    className={`p-3 rounded-lg border ${
                      stmt.valid
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          stmt.valid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {stmt.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        Line {stmt.lineNumber}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-mono text-gray-800">
                      {stmt.raw}
                    </p>
                    {!stmt.valid && stmt.errors.length > 0 && (
                      <p className="mt-1 text-xs text-red-600">
                        {stmt.errors[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                Parse PIL statements to see results
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INVARIANTS TAB
// ============================================================================

interface InvariantsTabProps {
  invariants: Record<InvariantId, Invariant>;
  setEnabled: (id: InvariantId, enabled: boolean) => void;
  setMode: (id: InvariantId, mode: EnforcementMode) => void;
}

function InvariantsTab({ invariants, setEnabled, setMode }: InvariantsTabProps) {
  const invariantIds = Object.keys(invariants) as InvariantId[];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">The 7 Constitutional Invariants</h2>
        <p className="text-blue-100">
          Immutable laws governing all Qontrek operations. These cannot be
          bypassed — they can only be toggled for testing purposes.
        </p>
        <div className="mt-4 flex gap-4">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <span className="text-2xl font-bold">
              {invariantIds.filter((id) => invariants[id].enabled).length}
            </span>
            <span className="text-sm ml-1">Active</span>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <span className="text-2xl font-bold">
              {invariantIds.filter((id) => invariants[id].enforcementMode === 'block').length}
            </span>
            <span className="text-sm ml-1">Blocking</span>
          </div>
        </div>
      </div>

      {/* Invariant Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invariantIds.map((id) => {
          const inv = invariants[id];
          return (
            <div
              key={id}
              className={`bg-white rounded-xl border-2 p-5 shadow-sm transition-all ${
                inv.enabled
                  ? 'border-gray-200'
                  : 'border-gray-100 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="inline-block px-2 py-1 text-xs font-bold rounded"
                    style={{
                      backgroundColor: `${getInvariantColor(inv.category)}20`,
                      color: getInvariantColor(inv.category),
                    }}
                  >
                    {id}
                  </span>
                  <span
                    className="ml-2 inline-block px-2 py-1 text-xs rounded"
                    style={{
                      backgroundColor: `${getSeverityColor(inv.severity)}20`,
                      color: getSeverityColor(inv.severity),
                    }}
                  >
                    {inv.severity}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inv.enabled}
                    onChange={(e) => setEnabled(id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {inv.name}
              </h3>

              {/* Expression */}
              <div className="bg-gray-900 rounded-lg p-3 mb-3">
                <code className="text-xs text-green-400 font-mono">
                  {inv.expression}
                </code>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 mb-4">{inv.description}</p>

              {/* Enforcement Mode */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Enforcement Mode
                </label>
                <div className="flex gap-1">
                  {(['block', 'warn', 'log'] as EnforcementMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setMode(id, mode)}
                      disabled={!inv.enabled}
                      className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                        inv.enforcementMode === mode
                          ? mode === 'block'
                            ? 'bg-red-100 text-red-700 border-2 border-red-300'
                            : mode === 'warn'
                            ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                            : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      } ${!inv.enabled && 'opacity-50 cursor-not-allowed'}`}
                    >
                      {getEnforcementIcon(mode)} {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TRANSITIONS TAB
// ============================================================================

interface TransitionsTabProps {
  validateTransition: (
    from: WorkflowState,
    to: WorkflowState,
    context: PILContext
  ) => any;
}

function TransitionsTab({ validateTransition }: TransitionsTabProps) {
  const states: WorkflowState[] = [
    'draft',
    'tested',
    'certified',
    'promoted',
    'deprecated',
    'archived',
  ];

  const [selectedFrom, setSelectedFrom] = useState<WorkflowState>('draft');
  const [selectedTo, setSelectedTo] = useState<WorkflowState>('tested');
  const [testContext, setTestContext] = useState<PILContext>({
    test_coverage: 0.85,
    human_approval: true,
    simulation_valid: true,
  });
  const [result, setResult] = useState<any>(null);

  const handleTest = useCallback(() => {
    const res = validateTransition(selectedFrom, selectedTo, testContext);
    setResult(res);
  }, [selectedFrom, selectedTo, testContext, validateTransition]);

  return (
    <div className="space-y-6">
      {/* State Machine Visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          State Machine
        </h3>
        <div className="flex items-center justify-center gap-2 flex-wrap py-4">
          {states.map((state, i) => (
            <React.Fragment key={state}>
              <div
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: `${getStateColor(state)}20`,
                  color: getStateColor(state),
                  border: `2px solid ${getStateColor(state)}`,
                }}
              >
                {state}
              </div>
              {i < states.length - 1 && (
                <span className="text-gray-400">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Valid Transitions Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Valid Transitions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500">From</th>
                <th className="text-left py-2 px-3 text-gray-500">To</th>
                <th className="text-left py-2 px-3 text-gray-500">
                  Requirements
                </th>
              </tr>
            </thead>
            <tbody>
              {VALID_TRANSITIONS.map((t) => (
                <tr key={t.id} className="border-b border-gray-100">
                  <td className="py-2 px-3">
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: `${getStateColor(t.from)}20`,
                        color: getStateColor(t.from),
                      }}
                    >
                      {t.from}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: `${getStateColor(t.to)}20`,
                        color: getStateColor(t.to),
                      }}
                    >
                      {t.to}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-xs text-gray-600">
                    {t.expression}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transition Tester */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Test Transition
        </h3>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">From</label>
            <select
              value={selectedFrom}
              onChange={(e) => setSelectedFrom(e.target.value as WorkflowState)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">To</label>
            <select
              value={selectedTo}
              onChange={(e) => setSelectedTo(e.target.value as WorkflowState)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTest}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Transition
            </button>
          </div>
        </div>

        {/* Context Editor */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">Context</label>
          <textarea
            value={JSON.stringify(testContext, null, 2)}
            onChange={(e) => {
              try {
                setTestContext(JSON.parse(e.target.value));
              } catch {
                // Ignore parse errors while typing
              }
            }}
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
          />
        </div>

        {/* Result */}
        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.valid
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{result.valid ? '✅' : '❌'}</span>
              <span
                className={`font-medium ${
                  result.valid ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.valid
                  ? 'Transition Valid'
                  : 'Transition Invalid'}
              </span>
            </div>
            {result.errors.length > 0 && (
              <ul className="text-sm text-red-600 space-y-1">
                {result.errors.map((err: string, i: number) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// VALIDATION TAB
// ============================================================================

interface ValidationTabProps {
  checkAllInvariants: (context: PILContext) => any;
  evaluateGate: (type: GateType, context: PILContext) => any;
  calculateTrustScore: (context: PILContext) => number;
  calculateProofDelta: (expected: number, actual: number) => number;
  lastValidation: any;
}

function ValidationTab({
  checkAllInvariants,
  evaluateGate,
  calculateTrustScore,
  calculateProofDelta,
  lastValidation,
}: ValidationTabProps) {
  const [context, setContext] = useState<PILContext>({
    authority_signature: 'sig_123',
    proof_hash: 'hash_abc',
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

  const [validationResult, setValidationResult] = useState<any>(null);
  const [gateResults, setGateResults] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState<number | null>(null);

  const handleValidate = useCallback(() => {
    const result = checkAllInvariants(context);
    setValidationResult(result);

    // Evaluate all gates
    const gates: GateType[] = ['Type_A', 'Type_B', 'Type_C', 'Type_Z'];
    const gResults = gates.map((g) => evaluateGate(g, context));
    setGateResults(gResults);

    // Calculate trust score
    const score = calculateTrustScore(context);
    setTrustScore(score);
  }, [context, checkAllInvariants, evaluateGate, calculateTrustScore]);

  return (
    <div className="space-y-6">
      {/* Context Editor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Validation Context
        </h3>
        <textarea
          value={JSON.stringify(context, null, 2)}
          onChange={(e) => {
            try {
              setContext(JSON.parse(e.target.value));
            } catch {
              // Ignore parse errors while typing
            }
          }}
          className="w-full h-48 px-4 py-3 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleValidate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Validate All
          </button>
        </div>
      </div>

      {validationResult && (
        <>
          {/* Invariant Results */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Invariant Check Results
              </h3>
              <span
                className={`px-4 py-2 rounded-full text-lg font-bold ${
                  validationResult.passed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {validationResult.score}%
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {validationResult.results.map((r: any) => (
                <div
                  key={r.invariantId}
                  className={`p-3 rounded-lg border ${
                    r.passed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.passed ? '✅' : '❌'}</span>
                    <span className="font-medium text-gray-900">
                      {r.invariantId}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{r.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gate Results */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Gate Evaluation
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {gateResults.map((g) => (
                <div
                  key={g.gate}
                  className={`p-4 rounded-lg border ${
                    g.triggered
                      ? g.action === 'block'
                        ? 'bg-red-50 border-red-200'
                        : g.action === 'auto_approve'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{g.gate}</span>
                    <span className="text-lg">
                      {g.triggered
                        ? g.action === 'block'
                          ? '🛑'
                          : g.action === 'auto_approve'
                          ? '✅'
                          : '⚠️'
                        : '⚪'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {g.triggered ? g.action : 'Not triggered'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Computed Metrics
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">Trust Score</p>
                <p className="text-3xl font-bold text-purple-900">
                  {trustScore !== null ? (trustScore * 100).toFixed(0) : '—'}%
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  (proof_depth × 0.4) + (verification × 0.35) + (simulation ×
                  0.25)
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Proof Delta</p>
                <p className="text-3xl font-bold text-blue-900">
                  {calculateProofDelta(1.0, context.simulation_validity || 0).toFixed(2)}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  ABS(expected - actual)
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-600 mb-1">Credit Balance</p>
                <p className="text-3xl font-bold text-emerald-900">
                  {context.credit_balance || 0}
                </p>
                <p className="text-xs text-emerald-500 mt-1">
                  Cost: {context.execution_cost || 0}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
