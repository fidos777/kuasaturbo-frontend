/**
 * PIL Store - Zustand State Management
 *
 * Manages PIL invariants, statements, and validation state.
 * Part of Sprint 5: PIL Framework
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  PILStoreState,
  InvariantId,
  Invariant,
  EnforcementMode,
  PILContext,
  PILStatement,
  PILKeyword,
  ParsedStatement,
  InvariantCheckResult,
  AllInvariantsResult,
  WorkflowState,
  TransitionValidationResult,
  GateType,
  GateEvaluationResult,
  GateAction,
} from '../types/pil';
import {
  THE_SEVEN_INVARIANTS,
  VALID_TRANSITIONS,
  GATES,
  TRUST_SCORE_FORMULA,
} from '../types/pil';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  invariants: { ...THE_SEVEN_INVARIANTS },
  statements: [] as PILStatement[],
  lastValidation: null as AllInvariantsResult | null,
  editorContent: '',
  parseErrors: [] as string[],
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const usePILStore = create<PILStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // INVARIANT MANAGEMENT
        // ====================================================================

        setInvariantEnabled: (id: InvariantId, enabled: boolean) => {
          set(
            (state) => ({
              invariants: {
                ...state.invariants,
                [id]: { ...state.invariants[id], enabled },
              },
            }),
            false,
            'pil/setInvariantEnabled'
          );
        },

        setEnforcementMode: (id: InvariantId, mode: EnforcementMode) => {
          set(
            (state) => ({
              invariants: {
                ...state.invariants,
                [id]: { ...state.invariants[id], enforcementMode: mode },
              },
            }),
            false,
            'pil/setEnforcementMode'
          );
        },

        // ====================================================================
        // PARSING
        // ====================================================================

        parseStatements: (content: string): PILStatement[] => {
          const lines = content.split('\n').filter((line) => line.trim());
          const statements: PILStatement[] = [];
          const errors: string[] = [];

          lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) {
              return; // Skip comments and empty lines
            }

            const statement = parseSingleStatement(trimmed, index + 1);
            statements.push(statement);

            if (!statement.valid) {
              errors.push(...statement.errors.map((e) => `Line ${index + 1}: ${e}`));
            }
          });

          set(
            { statements, parseErrors: errors },
            false,
            'pil/parseStatements'
          );

          return statements;
        },

        // ====================================================================
        // INVARIANT CHECKING
        // ====================================================================

        checkInvariant: (id: InvariantId, context: PILContext): InvariantCheckResult => {
          const invariant = get().invariants[id];

          if (!invariant.enabled) {
            return { invariantId: id, passed: true, reason: 'Invariant disabled' };
          }

          const result = evaluateInvariant(invariant, context);
          return result;
        },

        checkAllInvariants: (context: PILContext): AllInvariantsResult => {
          const state = get();
          const results: InvariantCheckResult[] = [];
          const failedInvariants: InvariantId[] = [];

          const invariantIds = Object.keys(state.invariants) as InvariantId[];

          for (const id of invariantIds) {
            const result = state.checkInvariant(id, context);
            results.push(result);

            if (!result.passed) {
              failedInvariants.push(id);
            }
          }

          const passed = failedInvariants.length === 0;
          const score = Math.round(
            ((results.length - failedInvariants.length) / results.length) * 100
          );

          const allResult: AllInvariantsResult = {
            passed,
            score,
            total: results.length,
            results,
            failedInvariants,
          };

          set({ lastValidation: allResult }, false, 'pil/checkAllInvariants');

          return allResult;
        },

        // ====================================================================
        // TRANSITION VALIDATION
        // ====================================================================

        validateTransition: (
          from: WorkflowState,
          to: WorkflowState,
          context: PILContext
        ): TransitionValidationResult => {
          const transition = VALID_TRANSITIONS.find(
            (t) => t.from === from && t.to === to
          );

          if (!transition) {
            return {
              valid: false,
              from,
              to,
              errors: [`Invalid transition: ${from} -> ${to}`],
              missingRequirements: [],
            };
          }

          const errors: string[] = [];
          const missingRequirements: string[] = [];

          for (const req of transition.requirements) {
            const value = context[req.field];
            const passed = evaluateRequirement(value, req.operator, req.value);

            if (!passed) {
              errors.push(
                `Requirement not met: ${req.field} ${req.operator} ${req.value}`
              );
              missingRequirements.push(req.field);
            }
          }

          return {
            valid: errors.length === 0,
            from,
            to,
            errors,
            missingRequirements,
          };
        },

        // ====================================================================
        // GATE EVALUATION
        // ====================================================================

        evaluateGate: (type: GateType, context: PILContext): GateEvaluationResult => {
          const gate = GATES.find((g) => g.type === type);

          if (!gate) {
            return {
              gate: type,
              triggered: false,
              action: 'block' as GateAction,
              reason: `Unknown gate type: ${type}`,
            };
          }

          const value = context[gate.condition.field] as number;
          const threshold = gate.condition.threshold;
          const operator = gate.condition.operator;

          const triggered = evaluateRequirement(value, operator, threshold);

          return {
            gate: type,
            triggered,
            action: gate.action,
            reason: triggered
              ? `${gate.condition.field} (${value}) ${operator} ${threshold}`
              : `${gate.condition.field} (${value}) did not meet ${operator} ${threshold}`,
            confidence: context.confidence as number | undefined,
            riskScore: context.risk_score as number | undefined,
          };
        },

        // ====================================================================
        // METRICS CALCULATION
        // ====================================================================

        calculateTrustScore: (context: PILContext): number => {
          let score = 0;

          for (const component of TRUST_SCORE_FORMULA.components) {
            const value = (context[component.field] as number) || 0;
            score += value * component.weight;
          }

          return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
        },

        calculateProofDelta: (expected: number, actual: number): number => {
          return Math.abs(expected - actual);
        },

        // ====================================================================
        // EDITOR
        // ====================================================================

        setEditorContent: (content: string) => {
          set({ editorContent: content }, false, 'pil/setEditorContent');
        },

        // ====================================================================
        // RESET
        // ====================================================================

        reset: () => {
          set(initialState, false, 'pil/reset');
        },
      }),
      {
        name: 'qontrek-pil-store',
        partialize: (state) => ({
          invariants: state.invariants,
          editorContent: state.editorContent,
        }),
      }
    ),
    { name: 'PILStore' }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseSingleStatement(raw: string, lineNumber: number): PILStatement {
  const errors: string[] = [];
  let parsed: ParsedStatement = { keyword: 'INVARIANT' as PILKeyword };

  // Detect keyword
  const keywords: PILKeyword[] = [
    'INVARIANT',
    'CONSTRAINT',
    'TRANSITION',
    'GATE',
    'METRIC',
    'FORMULA',
    'REQUIRE',
  ];

  let foundKeyword: PILKeyword | null = null;
  for (const kw of keywords) {
    if (raw.toUpperCase().startsWith(kw)) {
      foundKeyword = kw;
      break;
    }
  }

  if (!foundKeyword) {
    errors.push(`Unknown statement type. Expected one of: ${keywords.join(', ')}`);
    return {
      id: `stmt_${Date.now()}_${lineNumber}`,
      type: 'INVARIANT',
      raw,
      parsed,
      valid: false,
      errors,
      lineNumber,
    };
  }

  parsed.keyword = foundKeyword;

  // Parse based on keyword type
  try {
    switch (foundKeyword) {
      case 'INVARIANT':
        parsed = parseInvariantStatement(raw);
        break;
      case 'CONSTRAINT':
        parsed = parseConstraintStatement(raw);
        break;
      case 'TRANSITION':
        parsed = parseTransitionStatement(raw);
        break;
      case 'GATE':
        parsed = parseGateStatement(raw);
        break;
      case 'METRIC':
        parsed = parseMetricStatement(raw);
        break;
      case 'FORMULA':
        parsed = parseFormulaStatement(raw);
        break;
      case 'REQUIRE':
        parsed = parseRequireStatement(raw);
        break;
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'Parse error');
  }

  return {
    id: `stmt_${Date.now()}_${lineNumber}`,
    type: foundKeyword,
    raw,
    parsed,
    valid: errors.length === 0,
    errors,
    lineNumber,
  };
}

function parseInvariantStatement(raw: string): ParsedStatement {
  // INVARIANT name REQUIRE condition FOR scope
  const match = raw.match(/INVARIANT\s+(\w+)\s+REQUIRE\s+(.+?)\s+FOR\s+(\w+)/i);
  if (match) {
    return {
      keyword: 'INVARIANT',
      identifier: match[1],
      action: match[2],
      scope: match[3],
    };
  }
  return { keyword: 'INVARIANT', identifier: raw.replace(/^INVARIANT\s*/i, '') };
}

function parseConstraintStatement(raw: string): ParsedStatement {
  // CONSTRAINT metric operator value FOR scope
  const match = raw.match(
    /CONSTRAINT\s+(\w+)\s*(<=|>=|<|>|=|!=)\s*([\d.]+)\s+FOR\s+(\w+)/i
  );
  if (match) {
    return {
      keyword: 'CONSTRAINT',
      identifier: match[1],
      condition: {
        left: match[1],
        operator: match[2] as any,
        right: parseFloat(match[3]),
      },
      scope: match[4],
    };
  }
  throw new Error('Invalid CONSTRAINT syntax');
}

function parseTransitionStatement(raw: string): ParsedStatement {
  // TRANSITION from -> to REQUIRES condition
  const match = raw.match(
    /TRANSITION\s+(\w+)\s*->\s*(\w+)\s+REQUIRES\s+(.+)/i
  );
  if (match) {
    const [condField, condOp, condVal] = parseCondition(match[3]);
    return {
      keyword: 'TRANSITION',
      identifier: `${match[1]}_to_${match[2]}`,
      requirements: [
        {
          field: condField,
          operator: condOp as any,
          value: condVal,
        },
      ],
    };
  }
  throw new Error('Invalid TRANSITION syntax');
}

function parseGateStatement(raw: string): ParsedStatement {
  // GATE Type_X WHEN condition THEN action
  const match = raw.match(
    /GATE\s+(Type_\w+)\s+WHEN\s+(\w+)\s*(<=|>=|<|>|=)\s*([\d.]+)\s+THEN\s+(\w+)/i
  );
  if (match) {
    return {
      keyword: 'GATE',
      identifier: match[1],
      condition: {
        left: match[2],
        operator: match[3] as any,
        right: parseFloat(match[4]),
      },
      action: match[5],
    };
  }
  throw new Error('Invalid GATE syntax');
}

function parseMetricStatement(raw: string): ParsedStatement {
  // METRIC name = formula
  const match = raw.match(/METRIC\s+(\w+)\s*=\s*(.+)/i);
  if (match) {
    return {
      keyword: 'METRIC',
      identifier: match[1],
      action: match[2],
    };
  }
  throw new Error('Invalid METRIC syntax');
}

function parseFormulaStatement(raw: string): ParsedStatement {
  // FORMULA name = expression
  const match = raw.match(/FORMULA\s+(\w+)\s*=\s*(.+)/i);
  if (match) {
    return {
      keyword: 'FORMULA',
      identifier: match[1],
      action: match[2],
    };
  }
  throw new Error('Invalid FORMULA syntax');
}

function parseRequireStatement(raw: string): ParsedStatement {
  // REQUIRE condition FOR scope
  const match = raw.match(/REQUIRE\s+(.+?)\s+FOR\s+(\w+)/i);
  if (match) {
    return {
      keyword: 'REQUIRE',
      action: match[1],
      scope: match[2],
    };
  }
  throw new Error('Invalid REQUIRE syntax');
}

function parseCondition(condition: string): [string, string, unknown] {
  const match = condition.match(/(\w+)\s*(<=|>=|<|>|=|!=)\s*(.+)/);
  if (!match) {
    return [condition, '=', true];
  }

  let value: unknown = match[3].trim();
  if (value === 'TRUE' || value === 'true') value = true;
  else if (value === 'FALSE' || value === 'false') value = false;
  else if (value === 'NULL' || value === 'null') value = null;
  else if (!isNaN(parseFloat(value as string))) value = parseFloat(value as string);

  return [match[1], match[2], value];
}

function evaluateInvariant(
  invariant: Invariant,
  context: PILContext
): InvariantCheckResult {
  const id = invariant.id;

  switch (id) {
    case 'I1': // No Action Without Authority
      return {
        invariantId: id,
        passed: !!context.authority_signature,
        reason: context.authority_signature
          ? 'Authority signature present'
          : 'Missing authority signature',
        value: context.authority_signature,
        required: 'authority_signature',
      };

    case 'I2': // No Reality Without Proof
      return {
        invariantId: id,
        passed: !!context.proof_hash,
        reason: context.proof_hash ? 'Proof hash present' : 'Missing proof hash',
        value: context.proof_hash,
        required: 'proof_hash',
      };

    case 'I3': // No Trust Without Traceability
      return {
        invariantId: id,
        passed: context.audit_trail === true,
        reason: context.audit_trail
          ? 'Audit trail enabled'
          : 'Audit trail not enabled',
        value: context.audit_trail,
        required: true,
      };

    case 'I4': // No Economy Without Credits
      const balance = context.credit_balance ?? 0;
      const cost = context.execution_cost ?? 0;
      const hasCredits = balance >= cost;
      return {
        invariantId: id,
        passed: hasCredits,
        reason: hasCredits
          ? `Sufficient credits: ${balance} >= ${cost}`
          : `Insufficient credits: ${balance} < ${cost}`,
        value: balance,
        required: cost,
      };

    case 'I5': // No Chaos Without Consequence
      return {
        invariantId: id,
        passed: context.consequence_log === true,
        reason: context.consequence_log
          ? 'Consequence logging enabled'
          : 'Consequence logging not enabled',
        value: context.consequence_log,
        required: true,
      };

    case 'I6': // No Claim Without Proof of Logic
      return {
        invariantId: id,
        passed: context.proof_of_logic === true,
        reason: context.proof_of_logic
          ? 'Proof of logic present'
          : 'Missing proof of logic',
        value: context.proof_of_logic,
        required: true,
      };

    case 'I7': // No Prediction Without Simulation Proof
      return {
        invariantId: id,
        passed: context.simulation_proof === true,
        reason: context.simulation_proof
          ? 'Simulation proof present'
          : 'Missing simulation proof',
        value: context.simulation_proof,
        required: true,
      };

    default:
      return {
        invariantId: id,
        passed: false,
        reason: 'Unknown invariant',
      };
  }
}

function evaluateRequirement(
  value: unknown,
  operator: string,
  expected: unknown
): boolean {
  switch (operator) {
    case '=':
    case '==':
      return value === expected;
    case '!=':
      return value !== expected;
    case '>':
      return (value as number) > (expected as number);
    case '<':
      return (value as number) < (expected as number);
    case '>=':
      return (value as number) >= (expected as number);
    case '<=':
      return (value as number) <= (expected as number);
    default:
      return false;
  }
}

// ============================================================================
// SELECTORS
// ============================================================================

export const selectInvariants = (state: PILStoreState) => state.invariants;
export const selectStatements = (state: PILStoreState) => state.statements;
export const selectParseErrors = (state: PILStoreState) => state.parseErrors;
export const selectLastValidation = (state: PILStoreState) => state.lastValidation;
export const selectEditorContent = (state: PILStoreState) => state.editorContent;

export default usePILStore;
