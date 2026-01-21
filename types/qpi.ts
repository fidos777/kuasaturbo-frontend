// ============================================================================
// QPI (QONTREK PROOF INDEX) TYPE DEFINITIONS
// Sprint 3: QPI Dashboard - Real-time trust barometer by sector
// ============================================================================
// Invariant I2: "No Profit Without Proof" — Every claim must be backed
// Invariant I3: "No Scale Without Sector" — Sector context shapes trust
// ============================================================================

// Malaysian Economic Sectors (GDPval-MY aligned)
export type MalaysianSector =
  | 'manufacturing'
  | 'services'
  | 'agriculture'
  | 'mining'
  | 'construction'
  | 'finance'
  | 'retail'
  | 'tourism'
  | 'technology'
  | 'healthcare'
  | 'education'
  | 'logistics';

// Sector metadata with GDPval-MY integration
export interface SectorMetadata {
  id: MalaysianSector;
  name: string;
  nameMY: string; // Bahasa Malaysia name
  gdpContribution: number; // % of GDP
  employmentShare: number; // % of workforce
  digitalReadiness: number; // 0-100 score
  regulatoryComplexity: 'low' | 'medium' | 'high' | 'critical';
}

// GDPval-MY Sector Data
export const MALAYSIAN_SECTORS: Record<MalaysianSector, SectorMetadata> = {
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing',
    nameMY: 'Pembuatan',
    gdpContribution: 22.3,
    employmentShare: 16.8,
    digitalReadiness: 68,
    regulatoryComplexity: 'high',
  },
  services: {
    id: 'services',
    name: 'Services',
    nameMY: 'Perkhidmatan',
    gdpContribution: 57.6,
    employmentShare: 62.4,
    digitalReadiness: 72,
    regulatoryComplexity: 'medium',
  },
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    nameMY: 'Pertanian',
    gdpContribution: 7.1,
    employmentShare: 10.2,
    digitalReadiness: 42,
    regulatoryComplexity: 'medium',
  },
  mining: {
    id: 'mining',
    name: 'Mining & Quarrying',
    nameMY: 'Perlombongan',
    gdpContribution: 6.8,
    employmentShare: 0.4,
    digitalReadiness: 55,
    regulatoryComplexity: 'critical',
  },
  construction: {
    id: 'construction',
    name: 'Construction',
    nameMY: 'Pembinaan',
    gdpContribution: 4.2,
    employmentShare: 9.1,
    digitalReadiness: 48,
    regulatoryComplexity: 'high',
  },
  finance: {
    id: 'finance',
    name: 'Finance & Insurance',
    nameMY: 'Kewangan & Insurans',
    gdpContribution: 6.9,
    employmentShare: 3.2,
    digitalReadiness: 85,
    regulatoryComplexity: 'critical',
  },
  retail: {
    id: 'retail',
    name: 'Retail & Wholesale',
    nameMY: 'Runcit & Borong',
    gdpContribution: 12.4,
    employmentShare: 18.6,
    digitalReadiness: 62,
    regulatoryComplexity: 'low',
  },
  tourism: {
    id: 'tourism',
    name: 'Tourism & Hospitality',
    nameMY: 'Pelancongan',
    gdpContribution: 5.8,
    employmentShare: 11.2,
    digitalReadiness: 58,
    regulatoryComplexity: 'medium',
  },
  technology: {
    id: 'technology',
    name: 'Technology & ICT',
    nameMY: 'Teknologi & ICT',
    gdpContribution: 8.2,
    employmentShare: 4.8,
    digitalReadiness: 92,
    regulatoryComplexity: 'medium',
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    nameMY: 'Kesihatan',
    gdpContribution: 4.8,
    employmentShare: 5.6,
    digitalReadiness: 65,
    regulatoryComplexity: 'critical',
  },
  education: {
    id: 'education',
    name: 'Education',
    nameMY: 'Pendidikan',
    gdpContribution: 4.2,
    employmentShare: 6.8,
    digitalReadiness: 70,
    regulatoryComplexity: 'high',
  },
  logistics: {
    id: 'logistics',
    name: 'Logistics & Transport',
    nameMY: 'Logistik & Pengangkutan',
    gdpContribution: 5.4,
    employmentShare: 7.2,
    digitalReadiness: 60,
    regulatoryComplexity: 'medium',
  },
};

// ============================================================================
// QPI CORE METRICS
// ============================================================================

// Trust Level (aligned with workflow status)
export type TrustLevel = 'untested' | 'tested' | 'sandbox' | 'certified' | 'promoted';

// QPI Score Components
export interface QPIScoreBreakdown {
  proofDensity: number;      // 0-100: How many claims have proof
  verificationRate: number;  // 0-100: % of proofs verified successfully
  auditTrailDepth: number;   // 0-100: Depth of proof chain
  sectorAlignment: number;   // 0-100: Alignment with sector requirements
  temporalConsistency: number; // 0-100: Consistency over time
}

// Sector QPI Score
export interface SectorQPIScore {
  sector: MalaysianSector;
  overallScore: number;      // 0-100 composite score
  breakdown: QPIScoreBreakdown;
  trustLevel: TrustLevel;
  workflowCount: number;     // Active workflows in sector
  proofCount: number;        // Total proofs generated
  lastUpdated: string;       // ISO timestamp
  trend: 'improving' | 'stable' | 'declining';
  trendDelta: number;        // Change from previous period
}

// Trust Gap Analysis
export interface TrustGapAnalysis {
  sector: MalaysianSector;
  currentScore: number;
  targetScore: number;
  gap: number;
  primaryGapReason: string;
  recommendations: string[];
  estimatedTimeToClose: string; // e.g., "2-3 weeks"
  creditInvestmentRequired: number;
}

// ============================================================================
// PROOF CHAIN TYPES
// ============================================================================

// Proof Type Categories
export type ProofType =
  | 'execution'        // Workflow executed successfully
  | 'verification'     // Output verified against spec
  | 'audit'           // Third-party audit completed
  | 'compliance'      // Regulatory requirement met
  | 'certification'   // Formal certification achieved
  | 'attestation';    // Human attestation recorded

// Individual Proof Record
export interface ProofRecord {
  id: string;
  type: ProofType;
  workflowId: string;
  taskId: string;
  timestamp: string;
  proofHash: string;         // SHA-256 hash of proof data
  previousProofHash?: string; // Chain to previous proof
  sector: MalaysianSector;
  trustContribution: number; // How much this proof adds to trust
  metadata: {
    executionDuration?: number;
    inputHash?: string;
    outputHash?: string;
    verifierId?: string;
    complianceRef?: string;
  };
  status: 'pending' | 'verified' | 'disputed' | 'expired';
}

// Proof Chain (linked list of proofs)
export interface ProofChain {
  id: string;
  workflowId: string;
  sector: MalaysianSector;
  proofs: ProofRecord[];
  chainIntegrity: 'valid' | 'broken' | 'pending';
  totalTrustScore: number;
  createdAt: string;
  lastProofAt: string;
}

// ============================================================================
// QPI DASHBOARD DATA STRUCTURES
// ============================================================================

// Dashboard Summary
export interface QPIDashboardSummary {
  globalQPIScore: number;           // Platform-wide QPI
  totalWorkflows: number;
  totalProofs: number;
  averageTrustLevel: TrustLevel;
  topPerformingSector: MalaysianSector;
  lowestPerformingSector: MalaysianSector;
  creditsConsumedToday: number;
  creditsConsumedThisMonth: number;
  lastRefreshed: string;
}

// Heatmap Cell Data
export interface HeatmapCell {
  sector: MalaysianSector;
  score: number;
  intensity: 'low' | 'medium' | 'high' | 'critical';
  workflowCount: number;
  trend: 'up' | 'down' | 'stable';
}

// Time Series Data Point
export interface QPITimeSeriesPoint {
  timestamp: string;
  score: number;
  sector?: MalaysianSector;
}

// Audit Report Export Format
export interface QPIAuditReport {
  generatedAt: string;
  tenantId: string;
  reportPeriod: {
    start: string;
    end: string;
  };
  summary: QPIDashboardSummary;
  sectorScores: SectorQPIScore[];
  trustGaps: TrustGapAnalysis[];
  proofChains: ProofChain[];
  recommendations: string[];
  complianceStatus: {
    pdpa: 'compliant' | 'partial' | 'non-compliant';
    bnmGuidelines: 'compliant' | 'partial' | 'non-compliant';
    mscStatus: 'compliant' | 'partial' | 'non-compliant';
  };
  signatureHash: string;
}

// ============================================================================
// QPI CALCULATION HELPERS
// ============================================================================

// Calculate composite QPI score from breakdown
export function calculateQPIScore(breakdown: QPIScoreBreakdown): number {
  const weights = {
    proofDensity: 0.25,
    verificationRate: 0.30,
    auditTrailDepth: 0.15,
    sectorAlignment: 0.20,
    temporalConsistency: 0.10,
  };

  return Math.round(
    breakdown.proofDensity * weights.proofDensity +
    breakdown.verificationRate * weights.verificationRate +
    breakdown.auditTrailDepth * weights.auditTrailDepth +
    breakdown.sectorAlignment * weights.sectorAlignment +
    breakdown.temporalConsistency * weights.temporalConsistency
  );
}

// Get trust level from QPI score
export function getTrustLevelFromScore(score: number): TrustLevel {
  if (score >= 90) return 'promoted';
  if (score >= 75) return 'certified';
  if (score >= 50) return 'sandbox';
  if (score >= 25) return 'tested';
  return 'untested';
}

// Get intensity for heatmap
export function getHeatmapIntensity(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// Generate proof hash
export function generateProofHash(data: string): string {
  // In production, use actual SHA-256
  // This is a placeholder for demo purposes
  const hash = Array.from(data)
    .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)
    .toString(16)
    .padStart(64, '0');
  return hash.slice(0, 64);
}

// ============================================================================
// SAMPLE DATA FOR DEMO
// ============================================================================

export const SAMPLE_SECTOR_SCORES: SectorQPIScore[] = [
  {
    sector: 'technology',
    overallScore: 87,
    breakdown: {
      proofDensity: 92,
      verificationRate: 88,
      auditTrailDepth: 85,
      sectorAlignment: 82,
      temporalConsistency: 90,
    },
    trustLevel: 'certified',
    workflowCount: 156,
    proofCount: 2340,
    lastUpdated: new Date().toISOString(),
    trend: 'improving',
    trendDelta: 3.2,
  },
  {
    sector: 'finance',
    overallScore: 82,
    breakdown: {
      proofDensity: 88,
      verificationRate: 85,
      auditTrailDepth: 90,
      sectorAlignment: 75,
      temporalConsistency: 78,
    },
    trustLevel: 'certified',
    workflowCount: 89,
    proofCount: 1890,
    lastUpdated: new Date().toISOString(),
    trend: 'stable',
    trendDelta: 0.5,
  },
  {
    sector: 'retail',
    overallScore: 68,
    breakdown: {
      proofDensity: 72,
      verificationRate: 70,
      auditTrailDepth: 60,
      sectorAlignment: 68,
      temporalConsistency: 65,
    },
    trustLevel: 'sandbox',
    workflowCount: 234,
    proofCount: 1456,
    lastUpdated: new Date().toISOString(),
    trend: 'improving',
    trendDelta: 5.8,
  },
  {
    sector: 'manufacturing',
    overallScore: 61,
    breakdown: {
      proofDensity: 65,
      verificationRate: 62,
      auditTrailDepth: 58,
      sectorAlignment: 60,
      temporalConsistency: 55,
    },
    trustLevel: 'sandbox',
    workflowCount: 178,
    proofCount: 980,
    lastUpdated: new Date().toISOString(),
    trend: 'stable',
    trendDelta: 1.2,
  },
  {
    sector: 'healthcare',
    overallScore: 74,
    breakdown: {
      proofDensity: 78,
      verificationRate: 82,
      auditTrailDepth: 75,
      sectorAlignment: 68,
      temporalConsistency: 70,
    },
    trustLevel: 'sandbox',
    workflowCount: 67,
    proofCount: 890,
    lastUpdated: new Date().toISOString(),
    trend: 'improving',
    trendDelta: 4.1,
  },
  {
    sector: 'agriculture',
    overallScore: 45,
    breakdown: {
      proofDensity: 48,
      verificationRate: 42,
      auditTrailDepth: 40,
      sectorAlignment: 52,
      temporalConsistency: 45,
    },
    trustLevel: 'tested',
    workflowCount: 45,
    proofCount: 234,
    lastUpdated: new Date().toISOString(),
    trend: 'declining',
    trendDelta: -2.3,
  },
  {
    sector: 'logistics',
    overallScore: 58,
    breakdown: {
      proofDensity: 62,
      verificationRate: 55,
      auditTrailDepth: 52,
      sectorAlignment: 60,
      temporalConsistency: 58,
    },
    trustLevel: 'sandbox',
    workflowCount: 112,
    proofCount: 678,
    lastUpdated: new Date().toISOString(),
    trend: 'improving',
    trendDelta: 2.9,
  },
  {
    sector: 'tourism',
    overallScore: 52,
    breakdown: {
      proofDensity: 55,
      verificationRate: 50,
      auditTrailDepth: 48,
      sectorAlignment: 58,
      temporalConsistency: 50,
    },
    trustLevel: 'sandbox',
    workflowCount: 78,
    proofCount: 345,
    lastUpdated: new Date().toISOString(),
    trend: 'stable',
    trendDelta: 0.8,
  },
];

export const SAMPLE_DASHBOARD_SUMMARY: QPIDashboardSummary = {
  globalQPIScore: 68,
  totalWorkflows: 959,
  totalProofs: 8813,
  averageTrustLevel: 'sandbox',
  topPerformingSector: 'technology',
  lowestPerformingSector: 'agriculture',
  creditsConsumedToday: 2450,
  creditsConsumedThisMonth: 67800,
  lastRefreshed: new Date().toISOString(),
};
