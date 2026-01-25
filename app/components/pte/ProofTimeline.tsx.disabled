'use client';

// ============================================================================
// PROOF TIMELINE COMPONENT
// Sprint 4: PTE Module - Visual timeline of proof generation
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// ============================================================================

import { useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Link2,
  Zap,
} from 'lucide-react';
import {
  PTEProof,
  PTEProofType,
  ExecutionPhase,
  getProofTypeDisplayName,
  getPhaseDisplayName,
  verifyProofChain,
} from '@/types/pte';

interface ProofTimelineProps {
  proofs: PTEProof[];
  onProofSelect?: (proof: PTEProof) => void;
  selectedProofId?: string;
  variant?: 'horizontal' | 'vertical' | 'compact';
  showChainStatus?: boolean;
}

export default function ProofTimeline({
  proofs,
  onProofSelect,
  selectedProofId,
  variant = 'vertical',
  showChainStatus = true,
}: ProofTimelineProps) {
  // Calculate chain integrity
  const chainIntegrity = useMemo(() => verifyProofChain(proofs), [proofs]);

  // Calculate time span
  const timeSpan = useMemo(() => {
    if (proofs.length < 2) return null;
    const first = new Date(proofs[0].generatedAt).getTime();
    const last = new Date(proofs[proofs.length - 1].generatedAt).getTime();
    return last - first;
  }, [proofs]);

  // Get icon for proof type
  const getProofIcon = (type: PTEProofType, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

    switch (type) {
      case 'execution_start':
        return <Activity className={`${sizeClass} text-blue-400`} />;
      case 'checkpoint':
        return <Clock className={`${sizeClass} text-yellow-400`} />;
      case 'execution_complete':
        return <CheckCircle2 className={`${sizeClass} text-green-400`} />;
      case 'execution_failed':
        return <XCircle className={`${sizeClass} text-red-400`} />;
      case 'rollback':
        return <AlertTriangle className={`${sizeClass} text-orange-400`} />;
      case 'verification':
        return <Shield className={`${sizeClass} text-purple-400`} />;
      case 'attestation':
        return <Zap className={`${sizeClass} text-cyan-400`} />;
    }
  };

  // Get color for proof node
  const getNodeColor = (proof: PTEProof, isSelected: boolean) => {
    if (isSelected) return 'border-purple-500 bg-purple-500/20';

    switch (proof.type) {
      case 'execution_start':
        return 'border-blue-500 bg-blue-500/20';
      case 'checkpoint':
        return 'border-yellow-500 bg-yellow-500/20';
      case 'execution_complete':
        return 'border-green-500 bg-green-500/20';
      case 'execution_failed':
        return 'border-red-500 bg-red-500/20';
      case 'rollback':
        return 'border-orange-500 bg-orange-500/20';
      default:
        return 'border-gray-500 bg-gray-500/20';
    }
  };

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  // Truncate hash
  const truncateHash = (hash: string) => `${hash.slice(0, 8)}...`;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Proof Chain</span>
            <span className="text-xs text-gray-400">({proofs.length})</span>
          </div>
          {showChainStatus && (
            <span
              className={`px-2 py-0.5 text-xs rounded ${
                chainIntegrity
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {chainIntegrity ? '✓ Valid' : '✗ Broken'}
            </span>
          )}
        </div>

        {/* Compact timeline */}
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {proofs.map((proof, index) => (
            <div key={proof.id} className="flex items-center">
              {/* Node */}
              <button
                onClick={() => onProofSelect?.(proof)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${getNodeColor(
                  proof,
                  selectedProofId === proof.id
                )} ${onProofSelect ? 'cursor-pointer hover:scale-110' : ''}`}
                title={`${getProofTypeDisplayName(proof.type)} - ${truncateHash(proof.proofHash)}`}
              >
                {getProofIcon(proof.type, 'sm')}
              </button>

              {/* Connector */}
              {index < proofs.length - 1 && (
                <div
                  className={`w-4 h-0.5 ${
                    proof.verified ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-white">Proof Timeline</h3>
          </div>
          <div className="flex items-center gap-3">
            {timeSpan && (
              <span className="text-xs text-gray-400">
                Duration: {formatDuration(timeSpan)}
              </span>
            )}
            {showChainStatus && (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  chainIntegrity
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {chainIntegrity ? '✓ Chain Valid' : '✗ Chain Broken'}
              </span>
            )}
          </div>
        </div>

        {/* Horizontal timeline */}
        <div className="relative overflow-x-auto pb-4">
          <div className="flex items-start gap-0 min-w-max">
            {proofs.map((proof, index) => (
              <div key={proof.id} className="flex items-start">
                {/* Proof node */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => onProofSelect?.(proof)}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getNodeColor(
                      proof,
                      selectedProofId === proof.id
                    )} ${onProofSelect ? 'cursor-pointer hover:scale-110' : ''}`}
                  >
                    {getProofIcon(proof.type)}
                  </button>

                  {/* Label */}
                  <div className="mt-2 text-center max-w-24">
                    <div className="text-xs font-medium text-white truncate">
                      {getProofTypeDisplayName(proof.type)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(proof.generatedAt).toLocaleTimeString('en-MY', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                    {proof.verified && (
                      <CheckCircle2 className="w-3 h-3 text-green-400 mx-auto mt-1" />
                    )}
                  </div>
                </div>

                {/* Connector */}
                {index < proofs.length - 1 && (
                  <div className="flex items-center h-12 mx-1">
                    <div
                      className={`w-8 h-0.5 ${
                        chainIntegrity ? 'bg-purple-500' : 'bg-red-500'
                      }`}
                    />
                    <div
                      className={`w-0 h-0 border-y-4 border-y-transparent border-l-4 ${
                        chainIntegrity ? 'border-l-purple-500' : 'border-l-red-500'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vertical variant (default)
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-medium text-white">Proof Chain</h3>
          <span className="text-xs text-gray-400">({proofs.length} proofs)</span>
        </div>
        <div className="flex items-center gap-3">
          {timeSpan && (
            <span className="text-xs text-gray-400">
              Total: {formatDuration(timeSpan)}
            </span>
          )}
          {showChainStatus && (
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                chainIntegrity
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {chainIntegrity ? '✓ Chain Valid' : '✗ Chain Broken'}
            </span>
          )}
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div
          className={`absolute left-3 top-0 bottom-0 w-0.5 ${
            chainIntegrity ? 'bg-purple-500/50' : 'bg-red-500/50'
          }`}
        />

        {proofs.map((proof, index) => {
          const isSelected = selectedProofId === proof.id;
          const isLast = index === proofs.length - 1;

          return (
            <div key={proof.id} className="relative pb-6 last:pb-0">
              {/* Connection node */}
              <div
                className={`absolute -left-3 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${getNodeColor(
                  proof,
                  isSelected
                )}`}
              >
                {proof.verified ? (
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                ) : (
                  getProofIcon(proof.type, 'sm')
                )}
              </div>

              {/* Proof card */}
              <button
                onClick={() => onProofSelect?.(proof)}
                className={`w-full text-left ml-4 p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                } ${onProofSelect ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {getProofIcon(proof.type)}
                      <span className="text-sm font-medium text-white">
                        {getProofTypeDisplayName(proof.type)}
                      </span>
                      {proof.verified && (
                        <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Phase: {getPhaseDisplayName(proof.phase)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {new Date(proof.generatedAt).toLocaleTimeString('en-MY', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-1">
                      #{proof.sequenceNumber + 1}
                    </div>
                  </div>
                </div>

                {/* Hash preview */}
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Hash:</span>
                  <code className="text-purple-400 font-mono">
                    {truncateHash(proof.proofHash)}
                  </code>
                  {proof.previousProofHash && (
                    <>
                      <span className="text-gray-600">←</span>
                      <code className="text-gray-500 font-mono">
                        {truncateHash(proof.previousProofHash)}
                      </code>
                    </>
                  )}
                </div>

                {/* Metrics preview */}
                {proof.data.metrics && (
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    {proof.data.metrics.durationMs !== undefined && (
                      <span>Duration: {proof.data.metrics.durationMs}ms</span>
                    )}
                    {proof.data.metrics.creditsUsed !== undefined && (
                      <span className="text-yellow-400">
                        Credits: {proof.data.metrics.creditsUsed}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
        Invariant I2: No Profit Without Proof
      </div>
    </div>
  );
}
