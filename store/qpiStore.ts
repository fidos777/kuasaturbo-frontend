// ============================================================================
// QPI (QONTREK PROOF INDEX) STATE STORE
// Sprint 3: QPI Dashboard - Real-time trust barometer by sector
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// Invariant I3: "No Scale Without Sector" — Sector context shapes trust
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MalaysianSector,
  SectorQPIScore,
  QPIDashboardSummary,
  ProofRecord,
  ProofChain,
  TrustGapAnalysis,
  QPITimeSeriesPoint,
  SAMPLE_SECTOR_SCORES,
  SAMPLE_DASHBOARD_SUMMARY,
  generateProofHash,
  getTrustLevelFromScore,
  calculateQPIScore,
  QPIScoreBreakdown,
} from '@/types/qpi';

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface QPIStore {
  // State
  summary: QPIDashboardSummary | null;
  sectorScores: SectorQPIScore[];
  proofChains: ProofChain[];
  selectedSector: MalaysianSector | null;
  timeRange: '24h' | '7d' | '30d' | '90d';
  isLoading: boolean;
  lastError: string | null;

  // Time series data
  globalTimeSeries: QPITimeSeriesPoint[];
  sectorTimeSeries: Record<MalaysianSector, QPITimeSeriesPoint[]>;

  // Trust gap analysis
  trustGaps: TrustGapAnalysis[];

  // Actions
  initializeQPI: () => void;
  refreshQPIData: () => Promise<void>;
  selectSector: (sector: MalaysianSector | null) => void;
  setTimeRange: (range: '24h' | '7d' | '30d' | '90d') => void;

  // Proof management
  addProof: (proof: Omit<ProofRecord, 'id' | 'timestamp' | 'proofHash'>) => ProofRecord;
  getProofChain: (workflowId: string) => ProofChain | undefined;
  verifyProofChain: (chainId: string) => boolean;

  // Trust gap analysis
  calculateTrustGaps: () => void;
  getTrustGapForSector: (sector: MalaysianSector) => TrustGapAnalysis | undefined;

  // Export
  generateAuditReport: () => Promise<string>;

  // Computed getters
  getTopSectors: (count: number) => SectorQPIScore[];
  getBottomSectors: (count: number) => SectorQPIScore[];
  getSectorTrend: (sector: MalaysianSector) => 'improving' | 'stable' | 'declining';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateTimeSeries(
  baseScore: number,
  days: number,
  trend: 'improving' | 'stable' | 'declining'
): QPITimeSeriesPoint[] {
  const points: QPITimeSeriesPoint[] = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some variance based on trend
    const trendFactor = trend === 'improving' ? 0.1 : trend === 'declining' ? -0.1 : 0;
    const variance = (Math.random() - 0.5) * 5;
    const trendAdjustment = trendFactor * (days - i);
    const score = Math.max(0, Math.min(100, baseScore + variance + trendAdjustment));

    points.push({
      timestamp: date.toISOString(),
      score: Math.round(score * 10) / 10,
    });
  }

  return points;
}

function calculateTrustGap(sector: SectorQPIScore): TrustGapAnalysis {
  // Target score based on sector regulatory complexity
  const targetScores: Record<string, number> = {
    critical: 90,
    high: 80,
    medium: 70,
    low: 60,
  };

  const targetScore = targetScores[sector.breakdown.sectorAlignment > 70 ? 'critical' : 'medium'] || 75;
  const gap = targetScore - sector.overallScore;

  // Identify primary gap reason
  const breakdownEntries = Object.entries(sector.breakdown) as [keyof QPIScoreBreakdown, number][];
  const lowestComponent = breakdownEntries.reduce((min, current) =>
    current[1] < min[1] ? current : min
  );

  const reasonMap: Record<keyof QPIScoreBreakdown, string> = {
    proofDensity: 'Insufficient proof coverage for claims',
    verificationRate: 'Low verification success rate',
    auditTrailDepth: 'Shallow audit trail depth',
    sectorAlignment: 'Misalignment with sector requirements',
    temporalConsistency: 'Inconsistent performance over time',
  };

  return {
    sector: sector.sector,
    currentScore: sector.overallScore,
    targetScore,
    gap: Math.max(0, gap),
    primaryGapReason: reasonMap[lowestComponent[0]],
    recommendations: generateRecommendations(sector, lowestComponent[0]),
    estimatedTimeToClose: gap > 20 ? '4-6 weeks' : gap > 10 ? '2-3 weeks' : '1-2 weeks',
    creditInvestmentRequired: Math.round(gap * 150), // ~150 credits per point
  };
}

function generateRecommendations(
  sector: SectorQPIScore,
  weakestArea: keyof QPIScoreBreakdown
): string[] {
  const recommendations: string[] = [];

  switch (weakestArea) {
    case 'proofDensity':
      recommendations.push('Increase proof generation frequency for all workflow executions');
      recommendations.push('Enable automatic proof capture for critical operations');
      recommendations.push('Review and fill gaps in existing proof coverage');
      break;
    case 'verificationRate':
      recommendations.push('Review and fix failing verification checks');
      recommendations.push('Update verification criteria to match current outputs');
      recommendations.push('Add pre-execution validation to prevent failures');
      break;
    case 'auditTrailDepth':
      recommendations.push('Enable deeper proof chain linking');
      recommendations.push('Add intermediate proof checkpoints');
      recommendations.push('Implement cross-workflow proof dependencies');
      break;
    case 'sectorAlignment':
      recommendations.push(`Review ${sector.sector} sector compliance requirements`);
      recommendations.push('Update workflow configurations for sector-specific rules');
      recommendations.push('Consult sector regulatory guidelines');
      break;
    case 'temporalConsistency':
      recommendations.push('Implement consistent execution schedules');
      recommendations.push('Add monitoring for performance drift');
      recommendations.push('Review and address historical anomalies');
      break;
  }

  return recommendations;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useQPIStore = create<QPIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      summary: null,
      sectorScores: [],
      proofChains: [],
      selectedSector: null,
      timeRange: '7d',
      isLoading: false,
      lastError: null,
      globalTimeSeries: [],
      sectorTimeSeries: {} as Record<MalaysianSector, QPITimeSeriesPoint[]>,
      trustGaps: [],

      // Initialize with sample data
      initializeQPI: () => {
        const sectorScores = SAMPLE_SECTOR_SCORES;
        const summary = SAMPLE_DASHBOARD_SUMMARY;

        // Generate time series for global and each sector
        const days = 30;
        const globalTimeSeries = generateTimeSeries(summary.globalQPIScore, days, 'improving');

        const sectorTimeSeries: Record<MalaysianSector, QPITimeSeriesPoint[]> = {} as Record<MalaysianSector, QPITimeSeriesPoint[]>;
        sectorScores.forEach(sector => {
          sectorTimeSeries[sector.sector] = generateTimeSeries(
            sector.overallScore,
            days,
            sector.trend
          );
        });

        // Calculate trust gaps
        const trustGaps = sectorScores.map(calculateTrustGap);

        set({
          summary,
          sectorScores,
          globalTimeSeries,
          sectorTimeSeries,
          trustGaps,
          isLoading: false,
        });
      },

      // Refresh QPI data (simulated API call)
      refreshQPIData: async () => {
        const currentState = get();
        if (currentState.isLoading) return;
        set({ isLoading: true, lastError: null });

        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));

          // In production, this would fetch from API
          const { initializeQPI } = get();
          initializeQPI();

          set({
            isLoading: false,
            summary: {
              ...get().summary!,
              lastRefreshed: new Date().toISOString(),
            },
          });
        } catch (error) {
          set({
            isLoading: false,
            lastError: error instanceof Error ? error.message : 'Failed to refresh QPI data',
          });
        }
      },

      // Select sector for detail view
      selectSector: (sector) => {
        set({ selectedSector: sector });
      },

      // Set time range for charts
      setTimeRange: (range) => {
        set({ timeRange: range });
      },

      // Add a new proof record
      addProof: (proofData) => {
        const proofChains = get().proofChains;
        const existingChain = proofChains.find(c => c.workflowId === proofData.workflowId);

        const newProof: ProofRecord = {
          ...proofData,
          id: `proof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          proofHash: generateProofHash(JSON.stringify(proofData)),
          previousProofHash: existingChain?.proofs[existingChain.proofs.length - 1]?.proofHash,
        };

        if (existingChain) {
          // Add to existing chain
          const updatedChains = proofChains.map(chain => {
            if (chain.id === existingChain.id) {
              return {
                ...chain,
                proofs: [...chain.proofs, newProof],
                lastProofAt: newProof.timestamp,
                totalTrustScore: chain.totalTrustScore + newProof.trustContribution,
              };
            }
            return chain;
          });
          set({ proofChains: updatedChains });
        } else {
          // Create new chain
          const newChain: ProofChain = {
            id: `chain-${Date.now()}`,
            workflowId: proofData.workflowId,
            sector: proofData.sector,
            proofs: [newProof],
            chainIntegrity: 'valid',
            totalTrustScore: newProof.trustContribution,
            createdAt: newProof.timestamp,
            lastProofAt: newProof.timestamp,
          };
          set({ proofChains: [...proofChains, newChain] });
        }

        return newProof;
      },

      // Get proof chain for workflow
      getProofChain: (workflowId) => {
        return get().proofChains.find(c => c.workflowId === workflowId);
      },

      // Verify proof chain integrity
      verifyProofChain: (chainId) => {
        const chain = get().proofChains.find(c => c.id === chainId);
        if (!chain) return false;

        // Verify each proof links to previous
        for (let i = 1; i < chain.proofs.length; i++) {
          if (chain.proofs[i].previousProofHash !== chain.proofs[i - 1].proofHash) {
            // Mark chain as broken
            const updatedChains = get().proofChains.map(c => {
              if (c.id === chainId) {
                return { ...c, chainIntegrity: 'broken' as const };
              }
              return c;
            });
            set({ proofChains: updatedChains });
            return false;
          }
        }

        return true;
      },

      // Calculate trust gaps for all sectors
      calculateTrustGaps: () => {
        const { sectorScores } = get();
        const trustGaps = sectorScores.map(calculateTrustGap);
        set({ trustGaps });
      },

      // Get trust gap for specific sector
      getTrustGapForSector: (sector) => {
        return get().trustGaps.find(g => g.sector === sector);
      },

      // Generate audit report
      generateAuditReport: async () => {
        const { summary, sectorScores, trustGaps, proofChains } = get();

        const report = {
          generatedAt: new Date().toISOString(),
          tenantId: 'demo-tenant-001',
          reportPeriod: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
          summary,
          sectorScores,
          trustGaps,
          proofChains,
          recommendations: trustGaps
            .filter(g => g.gap > 10)
            .flatMap(g => g.recommendations)
            .slice(0, 10),
          complianceStatus: {
            pdpa: 'compliant' as const,
            bnmGuidelines: 'partial' as const,
            mscStatus: 'compliant' as const,
          },
          signatureHash: generateProofHash(JSON.stringify({ summary, sectorScores, timestamp: Date.now() })),
        };

        return JSON.stringify(report, null, 2);
      },

      // Get top performing sectors
      getTopSectors: (count) => {
        return [...get().sectorScores]
          .sort((a, b) => b.overallScore - a.overallScore)
          .slice(0, count);
      },

      // Get bottom performing sectors
      getBottomSectors: (count) => {
        return [...get().sectorScores]
          .sort((a, b) => a.overallScore - b.overallScore)
          .slice(0, count);
      },

      // Get sector trend
      getSectorTrend: (sector) => {
        const sectorScore = get().sectorScores.find(s => s.sector === sector);
        return sectorScore?.trend || 'stable';
      },
    }),
    {
      name: 'qontrek-qpi-store',
      partialize: (state) => ({
        timeRange: state.timeRange,
        selectedSector: state.selectedSector,
      }),
    }
  )
);
