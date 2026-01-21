'use client';

// ============================================================================
// PROOF EXPLORER COMPONENT
// Sprint 3.3: Drill into proof chain with full traceability
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// ============================================================================

import { useState, useMemo } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Shield,
  FileCheck,
  Activity,
  Lock,
} from 'lucide-react';
import { ProofChain, ProofRecord, ProofType, MALAYSIAN_SECTORS } from '@/types/qpi';

interface ProofExplorerProps {
  proofChains: ProofChain[];
  selectedChainId?: string;
  onSelectChain?: (chainId: string) => void;
  variant?: 'full' | 'compact';
}

export default function ProofExplorer({
  proofChains,
  selectedChainId,
  onSelectChain,
  variant = 'full',
}: ProofExplorerProps) {
  const [expandedChains, setExpandedChains] = useState<Set<string>>(new Set());
  const [expandedProofs, setExpandedProofs] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<ProofType | 'all'>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Filter chains based on proof type
  const filteredChains = useMemo(() => {
    if (filterType === 'all') return proofChains;
    return proofChains.filter((chain) =>
      chain.proofs.some((proof) => proof.type === filterType)
    );
  }, [proofChains, filterType]);

  // Get icon for proof type
  const getProofTypeIcon = (type: ProofType) => {
    switch (type) {
      case 'execution':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'verification':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'audit':
        return <FileCheck className="w-4 h-4 text-purple-400" />;
      case 'compliance':
        return <Shield className="w-4 h-4 text-yellow-400" />;
      case 'certification':
        return <Lock className="w-4 h-4 text-emerald-400" />;
      case 'attestation':
        return <ExternalLink className="w-4 h-4 text-cyan-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: ProofRecord['status']) => {
    switch (status) {
      case 'verified':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'disputed':
        return 'text-red-400 bg-red-400/10';
      case 'expired':
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Copy hash to clipboard
  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Toggle chain expansion
  const toggleChain = (chainId: string) => {
    const newExpanded = new Set(expandedChains);
    if (newExpanded.has(chainId)) {
      newExpanded.delete(chainId);
    } else {
      newExpanded.add(chainId);
    }
    setExpandedChains(newExpanded);
    onSelectChain?.(chainId);
  };

  // Toggle proof expansion
  const toggleProof = (proofId: string) => {
    const newExpanded = new Set(expandedProofs);
    if (newExpanded.has(proofId)) {
      newExpanded.delete(proofId);
    } else {
      newExpanded.add(proofId);
    }
    setExpandedProofs(newExpanded);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-MY', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Truncate hash for display
  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Recent Proofs</h3>
          <span className="text-xs text-gray-400">
            {proofChains.reduce((sum, c) => sum + c.proofs.length, 0)} total
          </span>
        </div>

        {proofChains.slice(0, 5).map((chain) => (
          <div
            key={chain.id}
            className="p-2 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white font-mono">
                  {truncateHash(chain.id)}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 text-xs rounded ${
                  chain.chainIntegrity === 'valid'
                    ? 'bg-green-500/20 text-green-400'
                    : chain.chainIntegrity === 'broken'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {chain.chainIntegrity}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {chain.proofs.length} proofs • Trust: {chain.totalTrustScore.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-medium text-white">Proof Explorer</h3>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1">
          {(['all', 'execution', 'verification', 'audit', 'compliance'] as const).map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filterType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Chain list */}
      <div className="space-y-2">
        {filteredChains.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-gray-800/30 rounded-lg">
            <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No proof chains found</p>
            <p className="text-xs mt-1">
              Execute workflows to generate proofs
            </p>
          </div>
        ) : (
          filteredChains.map((chain) => {
            const isExpanded = expandedChains.has(chain.id);
            const sectorMeta = MALAYSIAN_SECTORS[chain.sector];

            return (
              <div
                key={chain.id}
                className={`border rounded-lg transition-all ${
                  selectedChainId === chain.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                {/* Chain header */}
                <button
                  onClick={() => toggleChain(chain.id)}
                  className="w-full p-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white">
                          Chain: {truncateHash(chain.id)}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            chain.chainIntegrity === 'valid'
                              ? 'bg-green-500/20 text-green-400'
                              : chain.chainIntegrity === 'broken'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {chain.chainIntegrity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{sectorMeta?.name || chain.sector}</span>
                        <span>•</span>
                        <span>{chain.proofs.length} proofs</span>
                        <span>•</span>
                        <span>Trust: {chain.totalTrustScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    {formatTime(chain.lastProofAt)}
                  </div>
                </button>

                {/* Expanded proof list */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-gray-700/50">
                    <div className="relative pl-6 mt-3 space-y-0">
                      {/* Vertical connecting line */}
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-700" />

                      {chain.proofs.map((proof, index) => {
                        const isProofExpanded = expandedProofs.has(proof.id);

                        return (
                          <div key={proof.id} className="relative">
                            {/* Connection dot */}
                            <div
                              className={`absolute -left-[15px] top-3 w-3 h-3 rounded-full border-2 ${
                                proof.status === 'verified'
                                  ? 'bg-green-500 border-green-400'
                                  : proof.status === 'pending'
                                  ? 'bg-yellow-500 border-yellow-400'
                                  : 'bg-gray-500 border-gray-400'
                              }`}
                            />

                            {/* Proof card */}
                            <div
                              className={`ml-2 p-2 rounded-lg transition-all ${
                                isProofExpanded
                                  ? 'bg-gray-700/50'
                                  : 'hover:bg-gray-700/30'
                              }`}
                            >
                              <button
                                onClick={() => toggleProof(proof.id)}
                                className="w-full text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getProofTypeIcon(proof.type)}
                                    <span className="text-sm text-white capitalize">
                                      {proof.type}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 text-xs rounded ${getStatusColor(
                                        proof.status
                                      )}`}
                                    >
                                      {proof.status}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    +{proof.trustContribution.toFixed(1)} trust
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-mono text-gray-500">
                                    {truncateHash(proof.proofHash)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyHash(proof.proofHash);
                                    }}
                                    className="text-gray-500 hover:text-gray-300"
                                  >
                                    {copiedHash === proof.proofHash ? (
                                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </button>

                              {/* Expanded proof details */}
                              {isProofExpanded && (
                                <div className="mt-2 pt-2 border-t border-gray-600/50 space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-400">Workflow ID:</span>
                                      <span className="ml-2 text-white font-mono">
                                        {truncateHash(proof.workflowId)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Task ID:</span>
                                      <span className="ml-2 text-white font-mono">
                                        {truncateHash(proof.taskId)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Timestamp:</span>
                                      <span className="ml-2 text-white">
                                        {formatTime(proof.timestamp)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Sector:</span>
                                      <span className="ml-2 text-white capitalize">
                                        {proof.sector}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Proof chain link */}
                                  {proof.previousProofHash && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <Link2 className="w-3 h-3 text-purple-400" />
                                      <span className="text-gray-400">
                                        Linked to:
                                      </span>
                                      <span className="font-mono text-purple-400">
                                        {truncateHash(proof.previousProofHash)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Metadata */}
                                  {proof.metadata.executionDuration && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      <span className="text-gray-400">Duration:</span>
                                      <span className="text-white">
                                        {proof.metadata.executionDuration}ms
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
