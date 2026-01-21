'use client';

// ============================================================================
// AUDIT TRAIL VIEWER COMPONENT
// Sprint 4: PTE Module - Comprehensive audit trail visualization
// ============================================================================
// Invariant I5: "No Silence Without Signal" — Every interaction produces a trace
// ============================================================================

import { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Shield,
  ChevronDown,
  Filter,
  Download,
  Search,
  Link2,
} from 'lucide-react';
import {
  AuditTrail,
  AuditEvent,
  AuditEventType,
  getPhaseDisplayName,
} from '@/types/pte';

interface AuditTrailViewerProps {
  trail: AuditTrail;
  variant?: 'full' | 'compact' | 'timeline';
  maxEvents?: number;
  onExport?: () => void;
}

export default function AuditTrailViewer({
  trail,
  variant = 'full',
  maxEvents = 50,
  onExport,
}: AuditTrailViewerProps) {
  const [filterType, setFilterType] = useState<AuditEventType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Filter events
  const filteredEvents = useMemo(() => {
    let events = trail.events;

    if (filterType !== 'all') {
      events = events.filter((e) => e.type === filterType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      events = events.filter(
        (e) =>
          e.type.toLowerCase().includes(term) ||
          e.actor.toLowerCase().includes(term) ||
          JSON.stringify(e.details).toLowerCase().includes(term)
      );
    }

    return events.slice(0, maxEvents);
  }, [trail.events, filterType, searchTerm, maxEvents]);

  // Get icon for event type
  const getEventIcon = (type: AuditEventType) => {
    switch (type) {
      case 'context_created':
      case 'execution_started':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'checkpoint_reached':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'output_generated':
      case 'execution_completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'verification_passed':
      case 'proof_verified':
        return <Shield className="w-4 h-4 text-green-400" />;
      case 'verification_failed':
      case 'error_occurred':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'retry_attempted':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'rollback_initiated':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'proof_generated':
        return <Link2 className="w-4 h-4 text-purple-400" />;
      case 'attestation_added':
        return <User className="w-4 h-4 text-cyan-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get color for event type
  const getEventColor = (type: AuditEventType) => {
    switch (type) {
      case 'execution_completed':
      case 'verification_passed':
      case 'proof_verified':
        return 'border-green-500/30 bg-green-500/5';
      case 'verification_failed':
      case 'error_occurred':
      case 'rollback_initiated':
        return 'border-red-500/30 bg-red-500/5';
      case 'checkpoint_reached':
      case 'retry_attempted':
        return 'border-yellow-500/30 bg-yellow-500/5';
      default:
        return 'border-gray-600/30 bg-gray-800/30';
    }
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

  // Format event type for display
  const formatEventType = (type: AuditEventType) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Toggle event expansion
  const toggleEvent = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  // Truncate hash
  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Audit Trail</span>
            <span className="text-xs text-gray-400">({trail.eventCount} events)</span>
          </div>
          <span
            className={`px-2 py-0.5 text-xs rounded ${
              trail.trailIntegrity === 'valid'
                ? 'bg-green-500/20 text-green-400'
                : trail.trailIntegrity === 'broken'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {trail.trailIntegrity}
          </span>
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredEvents.slice(0, 10).map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2 p-2 bg-gray-800/30 rounded text-xs"
            >
              {getEventIcon(event.type)}
              <span className="text-gray-300">{formatEventType(event.type)}</span>
              <span className="text-gray-500 ml-auto">{formatTime(event.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Timeline variant
  if (variant === 'timeline') {
    return (
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-700" />

        {filteredEvents.map((event, index) => (
          <div key={event.id} className="relative pb-4 last:pb-0">
            {/* Connection dot */}
            <div
              className={`absolute -left-4 top-2 w-4 h-4 rounded-full border-2 ${
                event.type.includes('complete') || event.type.includes('passed')
                  ? 'bg-green-500 border-green-400'
                  : event.type.includes('failed') || event.type.includes('error')
                  ? 'bg-red-500 border-red-400'
                  : 'bg-gray-500 border-gray-400'
              }`}
            />

            {/* Event content */}
            <div className="ml-4">
              <div className="flex items-center gap-2">
                {getEventIcon(event.type)}
                <span className="text-sm font-medium text-white">
                  {formatEventType(event.type)}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {formatTime(event.timestamp)} • {event.actor}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Full variant
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-medium text-white">Audit Trail</h3>
            <p className="text-xs text-gray-400">
              {trail.eventCount} events • {formatTime(trail.firstEventAt)} to{' '}
              {formatTime(trail.lastEventAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Integrity badge */}
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              trail.trailIntegrity === 'valid'
                ? 'bg-green-500/20 text-green-400'
                : trail.trailIntegrity === 'broken'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {trail.trailIntegrity === 'valid'
              ? '✓ Integrity Valid'
              : trail.trailIntegrity === 'broken'
              ? '✗ Integrity Broken'
              : '⏳ Pending'}
          </span>

          {/* Export button */}
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            showFilters || filterType !== 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filter</span>
          {filterType !== 'all' && (
            <span className="ml-1 px-1.5 text-xs bg-white/20 rounded-full">1</span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Filter by event type:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {[
              'execution_started',
              'checkpoint_reached',
              'execution_completed',
              'error_occurred',
              'proof_generated',
              'proof_verified',
            ].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as AuditEventType)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filterType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {formatEventType(type as AuditEventType)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-gray-800/30 rounded-lg">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events match your filters</p>
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const isExpanded = expandedEvents.has(event.id);

            return (
              <div
                key={event.id}
                className={`border rounded-lg transition-all ${getEventColor(event.type)}`}
              >
                {/* Event header */}
                <button
                  onClick={() => toggleEvent(event.id)}
                  className="w-full p-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Sequence number */}
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded text-xs text-gray-300">
                      {index + 1}
                    </span>

                    {/* Icon and type */}
                    {getEventIcon(event.type)}
                    <div>
                      <span className="text-sm font-medium text-white">
                        {formatEventType(event.type)}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{getPhaseDisplayName(event.phase)}</span>
                        <span>•</span>
                        <span>{event.actor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatTime(event.timestamp)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-gray-700/50">
                    <div className="mt-3 space-y-3">
                      {/* Event details */}
                      {Object.keys(event.details).length > 0 && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Details:</div>
                          <div className="bg-gray-800/50 rounded p-2 text-xs">
                            <pre className="text-gray-300 whitespace-pre-wrap">
                              {JSON.stringify(event.details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Hash info */}
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-gray-400">Event Hash: </span>
                          <code className="text-purple-400 font-mono">
                            {truncateHash(event.eventHash)}
                          </code>
                        </div>
                        {event.previousEventHash && (
                          <div>
                            <span className="text-gray-400">Previous: </span>
                            <code className="text-gray-500 font-mono">
                              {truncateHash(event.previousEventHash)}
                            </code>
                          </div>
                        )}
                      </div>

                      {/* Related proof */}
                      {event.relatedProofId && (
                        <div className="flex items-center gap-2 text-xs">
                          <Link2 className="w-3 h-3 text-purple-400" />
                          <span className="text-gray-400">Related Proof:</span>
                          <code className="text-purple-400 font-mono">
                            {event.relatedProofId}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
        <span>
          Showing {filteredEvents.length} of {trail.eventCount} events
        </span>
        <span>Invariant I5: Every interaction produces a trace</span>
      </div>
    </div>
  );
}
