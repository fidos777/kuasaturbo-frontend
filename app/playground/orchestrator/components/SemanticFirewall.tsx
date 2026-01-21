'use client';

import { Shield, AlertTriangle, CheckCircle, Lock, Hash, GitBranch, Wallet, Scale, Calculator, Activity, User, Bot, Building2 } from 'lucide-react';
import { INVARIANTS, QONTREK_TAGLINES } from '@/types/orchestrator';

interface SemanticFirewallProps {
  variant?: 'banner' | 'badge' | 'compact';
  status?: 'active' | 'warning' | 'info';
}

export default function SemanticFirewall({
  variant = 'banner',
  status = 'active'
}: SemanticFirewallProps) {

  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs">
        <Shield size={12} className="text-amber-400" />
        <span className="text-amber-300 font-medium">Layer 0.5</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 rounded-lg">
        <Shield size={14} className="text-amber-400" />
        <span className="text-xs text-amber-200">
          Semantic Firewall Active
        </span>
        <CheckCircle size={12} className="text-green-400" />
      </div>
    );
  }

  // Full banner variant
  return (
    <div className="bg-gradient-to-r from-amber-900/30 via-amber-800/20 to-purple-900/30 border-b border-amber-500/30">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-400" />
            <span className="text-sm font-semibold text-amber-200">
              Semantic Firewall
            </span>
          </div>
          <div className="h-4 w-px bg-amber-500/30" />
          <span className="text-xs text-amber-300/80">
            Constitutional AI Governance Active
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gray-400">Non-Authoritative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gray-400">Human Review Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-gray-400">Layer 0.5 Orchestration</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Constitutional Notice component for output displays
export function ConstitutionalNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg ${className}`}>
      <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="text-xs text-amber-200/80">
        <p className="font-medium text-amber-200 mb-1">Non-Authoritative Output</p>
        <p>
          This workflow produces AI-generated analysis that requires human review
          before any action is taken. Outputs should be verified by qualified
          professionals.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// THE 7 INVARIANTS DISPLAY - Blueprint v2.0 (Laws of Physics)
// ============================================================================
const INVARIANT_ICONS: Record<string, typeof Lock> = {
  I1: Lock,        // No Action Without Authority
  I2: Hash,        // No Reality Without Proof
  I3: GitBranch,   // No Trust Without Traceability
  I4: Wallet,      // No Economy Without Credits
  I5: Scale,       // No Chaos Without Consequence
  I6: Calculator,  // No Claim Without Mathematical Verification
  I7: Activity,    // No Prediction Without Simulation
};

interface InvariantsDisplayProps {
  variant?: 'full' | 'compact' | 'minimal';
  showEra?: boolean;
  className?: string;
}

export function InvariantsDisplay({
  variant = 'compact',
  showEra = false,
  className = ''
}: InvariantsDisplayProps) {
  const invariantList = Object.values(INVARIANTS);

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Shield size={14} className="text-purple-400" />
        <span className="text-xs text-purple-300">7 Invariants Active</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-purple-400" />
          <span className="text-xs font-semibold text-purple-300">7 Invariants (Laws of Physics)</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {invariantList.map((inv) => {
            const Icon = INVARIANT_ICONS[inv.id];
            return (
              <div key={inv.id} className="flex items-center gap-1.5 text-xs text-gray-400">
                <Icon size={10} className="text-purple-400/60" />
                <span className="text-purple-300/80">{inv.id}:</span>
                <span className="truncate">{inv.name.replace('No ', '').split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full variant - displays all details
  return (
    <div className={`bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-purple-200">The 7 Invariants</h3>
        </div>
        <span className="text-xs text-purple-400/60">Laws of Physics - Blueprint v2.0</span>
      </div>

      <p className="text-xs text-gray-400 mb-4 italic">
        "{QONTREK_TAGLINES.physics}"
      </p>

      <div className="space-y-2">
        {invariantList.map((inv) => {
          const Icon = INVARIANT_ICONS[inv.id];
          const isVerificationEra = inv.era === 'Verification';
          return (
            <div
              key={inv.id}
              className={`flex items-start gap-3 p-2 rounded-lg ${
                isVerificationEra
                  ? 'bg-indigo-500/10 border border-indigo-500/20'
                  : 'bg-purple-500/10 border border-purple-500/20'
              }`}
            >
              <div className={`p-1.5 rounded ${isVerificationEra ? 'bg-indigo-500/20' : 'bg-purple-500/20'}`}>
                <Icon size={14} className={isVerificationEra ? 'text-indigo-400' : 'text-purple-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isVerificationEra ? 'text-indigo-300' : 'text-purple-300'}`}>
                    {inv.id}
                  </span>
                  <span className="text-xs font-medium text-white">{inv.name}</span>
                  {showEra && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isVerificationEra
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {inv.era}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">{inv.check}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-purple-500/20">
        <p className="text-[10px] text-center text-gray-500">
          Any attempted violation triggers automatic blocking.
        </p>
      </div>
    </div>
  );
}

// Three-Body Constitutional Statement
export function ConstitutionalStatement({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-amber-500/5 via-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-lg p-3 ${className}`}>
      <p className="text-xs text-center">
        <span className="text-amber-300">Orchestrator discovers capability.</span>
        {' '}
        <span className="text-purple-300">Qontrek decides trust.</span>
        {' '}
        <span className="text-blue-300">KuasaTurbo distributes value.</span>
      </p>
    </div>
  );
}

// ============================================================================
// DECISION MADE BY CARD (Soft Gap #5 - Role Transparency)
// ============================================================================
// Blueprint v2.0: Invariant I1 - "No Action Without Authority"
// Shows WHO made the certification decision and their role
// ============================================================================

type DecisionMakerRole = 'orchestrator' | 'qontrek_human' | 'qontrek_system';

interface DecisionMadeByProps {
  decision: 'approved' | 'sandbox' | 'rejected' | 'pending';
  decidedBy?: string;
  decidedAt?: string;
  role?: DecisionMakerRole;
  reason?: string;
  className?: string;
}

const ROLE_CONFIG: Record<DecisionMakerRole, { icon: typeof User; label: string; color: string }> = {
  orchestrator: {
    icon: Bot,
    label: 'Orchestrator (Automated)',
    color: 'text-amber-400',
  },
  qontrek_human: {
    icon: User,
    label: 'Qontrek Human Reviewer',
    color: 'text-purple-400',
  },
  qontrek_system: {
    icon: Building2,
    label: 'Qontrek System',
    color: 'text-blue-400',
  },
};

export function DecisionMadeByCard({
  decision,
  decidedBy,
  decidedAt,
  role = 'qontrek_human',
  reason,
  className = '',
}: DecisionMadeByProps) {
  const roleConfig = ROLE_CONFIG[role];
  const RoleIcon = roleConfig.icon;

  const decisionColors = {
    approved: 'bg-success/10 border-success/30 text-success',
    sandbox: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    rejected: 'bg-error/10 border-error/30 text-error',
    pending: 'bg-gray-700/50 border-gray-600 text-gray-400',
  };

  const decisionLabels = {
    approved: 'CERTIFIED',
    sandbox: 'SANDBOX',
    rejected: 'REJECTED',
    pending: 'PENDING REVIEW',
  };

  return (
    <div className={`bg-card border border-gray-700 rounded-card p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-purple-400" />
          <span className="text-xs font-semibold text-gray-300">Decision Made By</span>
        </div>
        <span className="text-[10px] text-gray-500">I1: Authority Required</span>
      </div>

      {/* Decision Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 ${decisionColors[decision]}`}>
        <div className={`w-2 h-2 rounded-full bg-current ${decision === 'pending' ? '' : 'animate-pulse'}`} />
        <span className="text-xs font-bold">{decisionLabels[decision]}</span>
      </div>

      {/* Decision Maker Info */}
      {decidedBy ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-gray-700/50`}>
              <RoleIcon size={18} className={roleConfig.color} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{decidedBy}</span>
                {role === 'qontrek_human' && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                    Human
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400">{roleConfig.label}</div>
              {decidedAt && (
                <div className="text-[10px] text-gray-500 mt-1">
                  {new Date(decidedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Decision Reason (Soft Gap #2) */}
          {reason && (
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 mb-1">Decision Reason:</div>
              <p className="text-xs text-gray-300">{reason}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-gray-500 text-sm mb-1">Awaiting Qontrek Review</div>
          <p className="text-[10px] text-gray-600">
            Only Qontrek can approve certification requests
          </p>
        </div>
      )}

      {/* Constitutional Footer */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <p className="text-[10px] text-gray-500 text-center">
          {role === 'orchestrator'
            ? 'Orchestrator proposed this workflow. Qontrek decides trust.'
            : 'Qontrek certification is required for marketplace eligibility.'}
        </p>
      </div>
    </div>
  );
}

// Compact version for list views
export function DecisionBadge({
  decision,
  role,
  decidedBy,
}: Pick<DecisionMadeByProps, 'decision' | 'role' | 'decidedBy'>) {
  const roleConfig = role ? ROLE_CONFIG[role] : ROLE_CONFIG.qontrek_human;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="flex items-center gap-2">
      <RoleIcon size={12} className={roleConfig.color} />
      <span className="text-xs text-gray-400">
        {decidedBy || (decision === 'pending' ? 'Awaiting review' : 'Unknown')}
      </span>
    </div>
  );
}
