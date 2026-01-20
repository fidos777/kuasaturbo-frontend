'use client';

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

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
