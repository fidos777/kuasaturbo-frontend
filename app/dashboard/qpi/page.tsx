'use client';

// ============================================================================
// QPI DASHBOARD PAGE
// Sprint 3: QPI Dashboard - Real-time trust barometer by sector
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// Invariant I3: "No Scale Without Sector" — Sector context shapes trust
// ============================================================================

import { useEffect, useState } from 'react';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  RefreshCw,
  BarChart3,
  Zap,
  Target,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useQPIStore } from '@/store/qpiStore';
import { SectorHeatmap, ProofExplorer, TrustTrendChart, GovernanceActivityFeed } from '@/app/components/qpi';
import { MALAYSIAN_SECTORS, MalaysianSector, getTrustLevelFromScore } from '@/types/qpi';
import { CreditBalance } from '@/app/components/credits';
import { useCreditStore } from '@/store/creditStore';

export default function QPIDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sectors' | 'proofs' | 'gaps'>('overview');
  const [isExporting, setIsExporting] = useState(false);

  // QPI Store
  const {
    summary,
    sectorScores,
    proofChains,
    selectedSector,
    timeRange,
    isLoading,
    trustGaps,
    globalTimeSeries,
    sectorTimeSeries,
    initializeQPI,
    refreshQPIData,
    selectSector,
    setTimeRange,
    generateAuditReport,
    getTopSectors,
    getBottomSectors,
  } = useQPIStore();

  // Credit Store
  const initializeBalance = useCreditStore((state) => state.initializeBalance);

  // Initialize on mount
  useEffect(() => {
    initializeQPI();
    initializeBalance('demo-tenant-001', 'Demo User');
  }, [initializeQPI, initializeBalance]);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const report = await generateAuditReport();
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qpi-audit-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Get selected sector details
  const selectedSectorData = selectedSector
    ? sectorScores.find((s) => s.sector === selectedSector)
    : null;
  const selectedSectorMeta = selectedSector ? MALAYSIAN_SECTORS[selectedSector] : null;

  // Top and bottom sectors
  const topSectors = getTopSectors(3);
  const bottomSectors = getBottomSectors(3);

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-500" />
                <h1 className="text-xl font-bold">QPI Dashboard</h1>
              </div>
              <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                Qontrek Proof Index
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Credit Balance */}
              <CreditBalance variant="compact" showTopUp />

              <div className="h-6 w-px bg-gray-700" />

              {/* Time Range Selector */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                {(['24h', '7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      timeRange === range
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <button
                onClick={refreshQPIData}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'sectors', label: 'Sectors', icon: Target },
              { id: 'proofs', label: 'Proof Chains', icon: Activity },
              { id: 'gaps', label: 'Trust Gaps', icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Global Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Global QPI</span>
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold">{summary.globalQPIScore}</span>
                  <span className="text-sm text-green-400 mb-1">+2.3%</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Trust Level: {getTrustLevelFromScore(summary.globalQPIScore)}
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Workflows</span>
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div className="mt-2 text-3xl font-bold">
                  {summary.totalWorkflows.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-gray-500">Across all sectors</div>
              </div>

              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Proofs</span>
                  <BarChart3 className="w-5 h-5 text-green-400" />
                </div>
                <div className="mt-2 text-3xl font-bold">
                  {summary.totalProofs.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-gray-500">Verified claims</div>
              </div>

              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Credits Today</span>
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="mt-2 text-3xl font-bold">
                  {summary.creditsConsumedToday.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {summary.creditsConsumedThisMonth.toLocaleString()} this month
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Sector Heatmap */}
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <SectorHeatmap
                  sectorScores={sectorScores}
                  onSectorSelect={selectSector}
                  selectedSector={selectedSector}
                  variant="grid"
                />
              </div>

              {/* Top & Bottom Performers */}
              <div className="space-y-4">
                {/* Top Performers */}
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <h3 className="text-sm font-medium">Top Performing Sectors</h3>
                  </div>
                  <div className="space-y-2">
                    {topSectors.map((sector, index) => (
                      <div
                        key={sector.sector}
                        className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-green-500/20 text-green-400 rounded text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">
                            {MALAYSIAN_SECTORS[sector.sector].name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{sector.overallScore}</span>
                          <span className="text-xs text-green-400">
                            +{sector.trendDelta.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Performers */}
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-medium">Needs Attention</h3>
                  </div>
                  <div className="space-y-2">
                    {bottomSectors.map((sector, index) => (
                      <div
                        key={sector.sector}
                        className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-red-500/20 text-red-400 rounded text-sm font-medium">
                            {sectorScores.length - 2 + index}
                          </span>
                          <span className="text-sm">
                            {MALAYSIAN_SECTORS[sector.sector].name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{sector.overallScore}</span>
                          <span
                            className={`text-xs ${
                              sector.trendDelta >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {sector.trendDelta >= 0 ? '+' : ''}
                            {sector.trendDelta.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Trend Chart */}
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
              <TrustTrendChart
                data={globalTimeSeries}
                timeRange={timeRange}
                height={220}
                showLegend={true}
                variant="area"
              />
            </div>

            {/* Bottom Row: Proof Chains + Activity Feed */}
            <div className="grid grid-cols-2 gap-6">
              {/* Recent Proof Chains */}
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <ProofExplorer proofChains={proofChains} variant="compact" />
              </div>

              {/* Governance Activity Feed */}
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <GovernanceActivityFeed
                  maxItems={10}
                  autoRefresh={true}
                  refreshInterval={60000}
                  variant="compact"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sectors Tab */}
        {activeTab === 'sectors' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Sector List */}
            <div className="col-span-1 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
              <SectorHeatmap
                sectorScores={sectorScores}
                onSectorSelect={selectSector}
                selectedSector={selectedSector}
                variant="list"
              />
            </div>

            {/* Sector Detail */}
            <div className="col-span-2">
              {selectedSectorData && selectedSectorMeta ? (
                <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedSectorMeta.name}</h2>
                      <p className="text-gray-400">{selectedSectorMeta.nameMY}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-purple-400">
                        {selectedSectorData.overallScore}
                      </div>
                      <div
                        className={`text-sm ${
                          selectedSectorData.trendDelta >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {selectedSectorData.trendDelta >= 0 ? '↑' : '↓'}{' '}
                        {Math.abs(selectedSectorData.trendDelta).toFixed(1)}% this period
                      </div>
                    </div>
                  </div>

                  {/* Sector Metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-xs text-gray-400">GDP Contribution</div>
                      <div className="text-lg font-bold">
                        {selectedSectorMeta.gdpContribution}%
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-xs text-gray-400">Employment Share</div>
                      <div className="text-lg font-bold">
                        {selectedSectorMeta.employmentShare}%
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-xs text-gray-400">Digital Readiness</div>
                      <div className="text-lg font-bold">
                        {selectedSectorMeta.digitalReadiness}/100
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-xs text-gray-400">Regulatory</div>
                      <div className="text-lg font-bold capitalize">
                        {selectedSectorMeta.regulatoryComplexity}
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">QPI Score Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedSectorData.breakdown).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-medium">{value}/100</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                value >= 80
                                  ? 'bg-green-500'
                                  : value >= 60
                                  ? 'bg-emerald-500'
                                  : value >= 40
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sector Trust Trend */}
                  {selectedSector && sectorTimeSeries[selectedSector] && (
                    <div className="pt-4 border-t border-gray-700">
                      <TrustTrendChart
                        data={sectorTimeSeries[selectedSector]}
                        sector={selectedSector}
                        timeRange={timeRange}
                        height={160}
                        showLegend={true}
                        variant="area"
                      />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div>
                      <div className="text-sm text-gray-400">Active Workflows</div>
                      <div className="text-2xl font-bold">
                        {selectedSectorData.workflowCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Total Proofs</div>
                      <div className="text-2xl font-bold">
                        {selectedSectorData.proofCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 bg-gray-800/50 border border-gray-700 rounded-xl text-center text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a sector to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proofs Tab */}
        {activeTab === 'proofs' && (
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <ProofExplorer proofChains={proofChains} variant="full" />
          </div>
        )}

        {/* Trust Gaps Tab */}
        {activeTab === 'gaps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Trust Gap Analysis</h2>
              <span className="text-sm text-gray-400">
                {trustGaps.filter((g) => g.gap > 10).length} sectors need attention
              </span>
            </div>

            <div className="grid gap-4">
              {trustGaps
                .sort((a, b) => b.gap - a.gap)
                .map((gap) => {
                  const sectorMeta = MALAYSIAN_SECTORS[gap.sector];
                  return (
                    <div
                      key={gap.sector}
                      className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{sectorMeta.name}</h3>
                            {gap.gap > 15 && (
                              <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                                High Priority
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {gap.primaryGapReason}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="text-xs text-gray-400">Current</div>
                              <div className="text-xl font-bold">{gap.currentScore}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                            <div className="text-center">
                              <div className="text-xs text-gray-400">Target</div>
                              <div className="text-xl font-bold text-purple-400">
                                {gap.targetScore}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gap Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Gap: {gap.gap} points</span>
                          <span>Est. {gap.estimatedTimeToClose}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{
                              width: `${(gap.currentScore / gap.targetScore) * 100}%`,
                            }}
                          />
                          <div
                            className="absolute top-0 h-full w-0.5 bg-purple-400"
                            style={{ left: '100%' }}
                          />
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="mt-4 pt-3 border-t border-gray-700">
                        <div className="text-xs text-gray-400 mb-2">Recommendations:</div>
                        <ul className="space-y-1">
                          {gap.recommendations.slice(0, 2).map((rec, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-300 flex items-start gap-2"
                            >
                              <span className="text-purple-400 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Investment Required */}
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Investment required:</span>
                        <span className="font-medium text-yellow-400">
                          ~{gap.creditInvestmentRequired.toLocaleString()} credits
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              Last updated: {new Date(summary.lastRefreshed).toLocaleString('en-MY')}
            </span>
            <span>
              Invariant I2: &quot;No Profit Without Proof&quot; — Every claim must be backed
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
