'use client';

// ============================================================================
// SECTOR HEATMAP COMPONENT
// Sprint 3.2: GDPval-MY integration - Trust gap visualization by sector
// ============================================================================
// Invariant I3: "No Scale Without Sector" — Sector context shapes trust
// ============================================================================

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, ChevronRight } from 'lucide-react';
import {
  MalaysianSector,
  SectorQPIScore,
  MALAYSIAN_SECTORS,
  getHeatmapIntensity,
} from '@/types/qpi';

interface SectorHeatmapProps {
  sectorScores: SectorQPIScore[];
  onSectorSelect: (sector: MalaysianSector) => void;
  selectedSector: MalaysianSector | null;
  variant?: 'grid' | 'list';
}

export default function SectorHeatmap({
  sectorScores,
  onSectorSelect,
  selectedSector,
  variant = 'grid',
}: SectorHeatmapProps) {
  const [showTooltip, setShowTooltip] = useState<MalaysianSector | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'gdp' | 'trend'>('score');

  // Sort sectors based on selected criteria
  const sortedScores = useMemo(() => {
    return [...sectorScores].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.overallScore - a.overallScore;
        case 'gdp':
          return (
            MALAYSIAN_SECTORS[b.sector].gdpContribution -
            MALAYSIAN_SECTORS[a.sector].gdpContribution
          );
        case 'trend':
          const trendOrder = { improving: 3, stable: 2, declining: 1 };
          return trendOrder[b.trend] - trendOrder[a.trend];
        default:
          return 0;
      }
    });
  }, [sectorScores, sortBy]);

  // Get color based on score intensity
  const getScoreColor = (score: number): string => {
    const intensity = getHeatmapIntensity(score);
    switch (intensity) {
      case 'critical':
        return 'bg-green-500/80 border-green-400';
      case 'high':
        return 'bg-emerald-500/60 border-emerald-400';
      case 'medium':
        return 'bg-yellow-500/60 border-yellow-400';
      case 'low':
        return 'bg-red-500/60 border-red-400';
    }
  };

  // Get trend icon
  const TrendIcon = ({ trend }: { trend: 'improving' | 'stable' | 'declining' }) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'declining':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  if (variant === 'list') {
    return (
      <div className="space-y-2">
        {/* Sort controls */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">Sort by:</span>
          {(['score', 'gdp', 'trend'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-2 py-1 text-xs rounded ${
                sortBy === option
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option === 'gdp' ? 'GDP' : option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* List view */}
        {sortedScores.map((sector) => {
          const metadata = MALAYSIAN_SECTORS[sector.sector];
          const isSelected = selectedSector === sector.sector;

          return (
            <button
              key={sector.sector}
              onClick={() => onSectorSelect(sector.sector)}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Score indicator */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${getScoreColor(
                      sector.overallScore
                    )}`}
                  >
                    {sector.overallScore}
                  </div>

                  {/* Sector info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{metadata.name}</span>
                      <TrendIcon trend={sector.trend} />
                      <span
                        className={`text-xs ${
                          sector.trendDelta >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {sector.trendDelta >= 0 ? '+' : ''}
                        {sector.trendDelta.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{metadata.nameMY}</span>
                      <span>•</span>
                      <span>{metadata.gdpContribution}% GDP</span>
                      <span>•</span>
                      <span>{sector.workflowCount} workflows</span>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-5 h-5 transition-transform ${
                    isSelected ? 'text-purple-400 rotate-90' : 'text-gray-500'
                  }`}
                />
              </div>

              {/* Trust level badge */}
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    sector.trustLevel === 'promoted'
                      ? 'bg-green-500/20 text-green-400'
                      : sector.trustLevel === 'certified'
                      ? 'bg-blue-500/20 text-blue-400'
                      : sector.trustLevel === 'sandbox'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {sector.trustLevel}
                </span>
                <span className="text-xs text-gray-500">
                  {sector.proofCount.toLocaleString()} proofs
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white">Sector Trust Heatmap</h3>
          <button
            className="text-gray-400 hover:text-gray-300"
            onMouseEnter={() => setShowTooltip('technology' as MalaysianSector)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/60" />
            <span className="text-gray-400">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500/60" />
            <span className="text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500/60" />
            <span className="text-gray-400">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500/80" />
            <span className="text-gray-400">Critical</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {sortedScores.map((sector) => {
          const metadata = MALAYSIAN_SECTORS[sector.sector];
          const isSelected = selectedSector === sector.sector;
          const isHovered = showTooltip === sector.sector;

          return (
            <button
              key={sector.sector}
              onClick={() => onSectorSelect(sector.sector)}
              onMouseEnter={() => setShowTooltip(sector.sector)}
              onMouseLeave={() => setShowTooltip(null)}
              className={`relative p-3 rounded-lg border transition-all ${getScoreColor(
                sector.overallScore
              )} ${
                isSelected
                  ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900'
                  : 'hover:scale-105'
              }`}
            >
              {/* Score */}
              <div className="text-2xl font-bold text-white">{sector.overallScore}</div>

              {/* Sector name */}
              <div className="text-xs text-white/80 truncate">{metadata.name}</div>

              {/* Trend indicator */}
              <div className="absolute top-2 right-2">
                <TrendIcon trend={sector.trend} />
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                  <div className="text-sm font-medium text-white mb-1">{metadata.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{metadata.nameMY}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">GDP Contribution:</span>
                      <span className="text-white">{metadata.gdpContribution}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Digital Readiness:</span>
                      <span className="text-white">{metadata.digitalReadiness}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Workflows:</span>
                      <span className="text-white">{sector.workflowCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Proofs:</span>
                      <span className="text-white">{sector.proofCount.toLocaleString()}</span>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-700" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-700">
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">
            {sortedScores.filter((s) => s.trend === 'improving').length}
          </div>
          <div className="text-xs text-gray-400">Improving</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-400">
            {sortedScores.filter((s) => s.trend === 'stable').length}
          </div>
          <div className="text-xs text-gray-400">Stable</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-400">
            {sortedScores.filter((s) => s.trend === 'declining').length}
          </div>
          <div className="text-xs text-gray-400">Declining</div>
        </div>
      </div>
    </div>
  );
}
