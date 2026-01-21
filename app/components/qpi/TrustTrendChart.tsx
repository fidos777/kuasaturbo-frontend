'use client';

// ============================================================================
// TRUST TREND CHART COMPONENT
// Sprint 3: QPI Dashboard - Time series visualization of trust metrics
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// ============================================================================

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { QPITimeSeriesPoint, MalaysianSector, MALAYSIAN_SECTORS } from '@/types/qpi';

interface TrustTrendChartProps {
  data: QPITimeSeriesPoint[];
  sector?: MalaysianSector;
  timeRange: '24h' | '7d' | '30d' | '90d';
  height?: number;
  showLegend?: boolean;
  variant?: 'line' | 'area' | 'sparkline';
}

export default function TrustTrendChart({
  data,
  sector,
  timeRange,
  height = 200,
  showLegend = true,
  variant = 'area',
}: TrustTrendChartProps) {
  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    switch (timeRange) {
      case '24h':
        cutoff.setHours(cutoff.getHours() - 24);
        break;
      case '7d':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(cutoff.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(cutoff.getDate() - 90);
        break;
    }

    return data.filter((point) => new Date(point.timestamp) >= cutoff);
  }, [data, timeRange]);

  // Calculate stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const scores = filteredData.map((d) => d.score);
    const first = scores[0];
    const last = scores[scores.length - 1];
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const change = last - first;
    const changePercent = first > 0 ? ((change / first) * 100).toFixed(1) : '0';

    return { first, last, min, max, avg, change, changePercent };
  }, [filteredData]);

  // Calculate chart dimensions
  const chartWidth = 100; // percentage
  const chartHeight = height - 40; // leave room for labels

  // Generate SVG path
  const pathData = useMemo((): { linePath: string; areaPath: string; points: { x: number; y: number }[] } | null => {
    if (filteredData.length < 2 || !stats) return null;

    const points = filteredData.map((point, index) => {
      const x = (index / (filteredData.length - 1)) * 100;
      const y = 100 - ((point.score - stats.min) / (stats.max - stats.min + 1)) * 100;
      return { x, y };
    });

    // Line path
    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // Area path (for fill)
    const areaPath =
      linePath +
      ` L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

    return { linePath, areaPath, points };
  }, [filteredData, stats]);

  // Get trend icon
  const getTrendIcon = () => {
    if (!stats) return <Minus className="w-4 h-4 text-gray-400" />;
    if (stats.change > 1) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (stats.change < -1) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // Format date for x-axis labels
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === '24h') {
      return date.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' });
  };

  if (!stats || filteredData.length < 2 || !pathData) {
    return (
      <div
        className="flex items-center justify-center text-gray-400 bg-gray-800/30 rounded-lg"
        style={{ height }}
      >
        <p className="text-sm">Insufficient data for chart</p>
      </div>
    );
  }

  // Sparkline variant (minimal)
  if (variant === 'sparkline') {
    return (
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 100 30"
          className="w-20 h-6"
          preserveAspectRatio="none"
        >
          <path
            d={pathData.linePath}
            fill="none"
            stroke={stats.change >= 0 ? '#22c55e' : '#ef4444'}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className={`text-xs font-medium ${
            stats.change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {stats.change >= 0 ? '+' : ''}
          {stats.changePercent}%
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      {showLegend && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white">
              {sector ? MALAYSIAN_SECTORS[sector].name : 'Global'} Trust Trend
            </h4>
            {getTrendIcon()}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Current:</span>
              <span className="font-medium text-white">{stats.last.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Change:</span>
              <span
                className={`font-medium ${
                  stats.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {stats.change >= 0 ? '+' : ''}
                {stats.changePercent}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div
        className="relative bg-gray-800/30 rounded-lg overflow-hidden"
        style={{ height: chartHeight }}
      >
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500 py-1">
          <span>{stats.max.toFixed(0)}</span>
          <span>{stats.avg.toFixed(0)}</span>
          <span>{stats.min.toFixed(0)}</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-10 right-2 top-2 bottom-6">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <line
              x1="0"
              y1="25"
              x2="100"
              y2="25"
              stroke="#374151"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <line
              x1="0"
              y1="50"
              x2="100"
              y2="50"
              stroke="#374151"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <line
              x1="0"
              y1="75"
              x2="100"
              y2="75"
              stroke="#374151"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />

            {/* Area fill */}
            {variant === 'area' && (
              <path
                d={pathData.areaPath}
                fill="url(#areaGradient)"
                opacity="0.3"
              />
            )}

            {/* Line */}
            <path
              d={pathData.linePath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />

            {/* Data points */}
            {pathData.points?.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill="#a855f7"
                className="hover:r-3 transition-all cursor-pointer"
              />
            ))}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-10 right-2 bottom-0 flex justify-between text-xs text-gray-500">
          <span>{formatDate(filteredData[0].timestamp)}</span>
          <span>
            {formatDate(filteredData[Math.floor(filteredData.length / 2)].timestamp)}
          </span>
          <span>{formatDate(filteredData[filteredData.length - 1].timestamp)}</span>
        </div>
      </div>

      {/* Stats footer */}
      {showLegend && (
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
          <span>
            Range: {stats.min.toFixed(1)} - {stats.max.toFixed(1)}
          </span>
          <span>Avg: {stats.avg.toFixed(1)}</span>
          <span>{filteredData.length} data points</span>
        </div>
      )}
    </div>
  );
}
