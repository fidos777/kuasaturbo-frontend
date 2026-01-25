'use client';

// ============================================================================
// EXECUTION PROOF COMPONENT
// Sprint 4: PTE Module - Visual proof chain representation
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// ============================================================================

import { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Copy,
  ChevronDown,
  ChevronRight,
  Link2,
  Activity,
  Zap,
} from 'lucide-react';
import {
  PTEProof,
  PTEProofType,
  ExecutionPhase,
  getProofTypeDisplayName,
  getPhaseDisplayName,
} from '@/types/pte';

interface ExecutionProofProps {
  proof: PTEProof;
  isFirst?: boolean;
  isLast?: boolean;
  onVerify?: (proofId: string) => void;
  variant?: 'full' | 'compact' | 'inline';
}

export default function ExecutionProof({
  proof,
  isFirst = false,
  isLast = false,
  onVerify,
  variant = 'full',
}: ExecutionProofProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Copy hash to clipboard
  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Truncate hash for display
  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 12)}...${hash.slice(-8)}`;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-MY', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get icon for proof type
  const getProofIcon = (type: PTEProofType) => {
    switch (type) {
      case 'execution_start':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'checkpoint':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'execution_complete':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'execution_failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'rollback':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'verification':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'attestation':
        return <Zap className="w-4 h-4 text-cyan-400" />;
    }
  };

  // Get color scheme for proof type
  const getProofColors = (type: PTEProofType) => {
    switch (type) {
      case 'execution_start':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'checkpoint':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'execution_complete':
        return 'border-green-500/30 bg-green-500/10';
      case 'execution_failed':
        return 'border-red-500/30 bg-red-500/10';
      case 'rollback':
        return 'border-orange-500/30 bg-orange-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  // Inline variant (minimal)
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm">
        {getProofIcon(proof.type)}
        <span className="text-gray-300">{getProofTypeDisplayName(proof.type)}</span>
        <span className="text-gray-500">•</span>
        <span className="text-xs text-gray-400 font-mono">{truncateHash(proof.proofHash)}</span>
        {proof.verified && (
          <CheckCircle2 className="w-3 h-3 text-green-400" />
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        className={`p-3 rounded-lg border ${getProofColors(proof.type)} transition-all hover:border-opacity-60`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getProofIcon(proof.type)}
            <span className="text-sm font-medium text-white">
              {getProofTypeDisplayName(proof.type)}
            </span>
            {proof.verified ? (
              <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                Verified
              </span>
            ) : (
              <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                Pending
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{formatTime(proof.generatedAt)}</span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-gray-500">Hash:</span>
          <code className="text-gray-400 font-mono">{truncateHash(proof.proofHash)}</code>
          <button
            onClick={() => copyHash(proof.proofHash)}
            className="text-gray-500 hover:text-gray-300"
          >
            {copiedHash === proof.proofHash ? (
              <CheckCircle2 className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="relative">
      {/* Connection line */}
      {!isFirst && (
        <div className="absolute -top-4 left-5 w-0.5 h-4 bg-gray-600" />
      )}
      {!isLast && (
        <div className="absolute -bottom-4 left-5 w-0.5 h-4 bg-gray-600" />
      )}

      {/* Proof card */}
      <div
        className={`relative border rounded-lg ${getProofColors(proof.type)} transition-all`}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            {/* Sequence indicator */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                proof.verified
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : 'bg-gray-700/50 border-2 border-gray-600'
              }`}
            >
              <span className="text-sm font-bold text-white">#{proof.sequenceNumber + 1}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                {getProofIcon(proof.type)}
                <span className="font-medium text-white">
                  {getProofTypeDisplayName(proof.type)}
                </span>
                {proof.verified ? (
                  <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                    Pending Verification
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span>Phase: {getPhaseDisplayName(proof.phase)}</span>
                <span>•</span>
                <span>{formatTime(proof.generatedAt)}</span>
              </div>
            </div>
          </div>

          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 border-t border-gray-700/50">
            <div className="space-y-4">
              {/* Hash details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Proof Hash</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-green-400 font-mono bg-gray-800 px-2 py-1 rounded">
                      {truncateHash(proof.proofHash)}
                    </code>
                    <button
                      onClick={() => copyHash(proof.proofHash)}
                      className="text-gray-500 hover:text-gray-300"
                    >
                      {copiedHash === proof.proofHash ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {proof.previousProofHash && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      Previous Hash
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-purple-400 font-mono bg-gray-800 px-2 py-1 rounded">
                        {truncateHash(proof.previousProofHash)}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* Proof data */}
              {proof.data && (
                <div>
                  <div className="text-xs text-gray-400 mb-2">Proof Data</div>
                  <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                    {proof.data.inputSnapshot && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Input Snapshot:</span>
                        <code className="text-blue-400 font-mono">
                          {truncateHash(proof.data.inputSnapshot)}
                        </code>
                      </div>
                    )}
                    {proof.data.outputSnapshot && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Output Snapshot:</span>
                        <code className="text-green-400 font-mono">
                          {truncateHash(proof.data.outputSnapshot)}
                        </code>
                      </div>
                    )}
                    {proof.data.stateSnapshot && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">State Snapshot:</span>
                        <code className="text-yellow-400 font-mono">
                          {truncateHash(proof.data.stateSnapshot)}
                        </code>
                      </div>
                    )}
                    {proof.data.metrics && (
                      <div className="pt-2 border-t border-gray-700/50">
                        <div className="flex items-center gap-4 text-xs">
                          {proof.data.metrics.durationMs !== undefined && (
                            <span className="text-gray-300">
                              Duration: {proof.data.metrics.durationMs}ms
                            </span>
                          )}
                          {proof.data.metrics.creditsUsed !== undefined && (
                            <span className="text-yellow-400">
                              Credits: {proof.data.metrics.creditsUsed}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Verification info */}
              {proof.verified && proof.verifiedAt && (
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Verified at {formatTime(proof.verifiedAt)}
                  </span>
                  {proof.verifiedBy && (
                    <span>by {proof.verifiedBy}</span>
                  )}
                </div>
              )}

              {/* Tags */}
              {proof.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  {proof.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              {!proof.verified && onVerify && (
                <div className="pt-2 border-t border-gray-700/50">
                  <button
                    onClick={() => onVerify(proof.id)}
                    className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    Verify Proof
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
