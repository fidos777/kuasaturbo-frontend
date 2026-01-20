// Solar Feasibility Types

export interface SolarInput {
  monthlyBill: number;
  state: string;
  buildingType: 'residential' | 'commercial' | 'industrial';
  roofSize?: number;
}

export interface SolarCalculation {
  systemSizeKwp: number;
  panelCount: number;
  annualGenerationKwh: number;
  selfConsumptionKwh: number;
  exportToGridKwh: number;
  currentMonthlyBill: number;
  billAfterSolar: number;
  monthlySavings: number;
  annualSavings: number;
  systemCost: number;
  paybackYears: number;
  twentyFiveYearSavings: number;
  co2AvoidedTons: number;
  treesEquivalent: number;
}

export interface SolarReport {
  input: SolarInput;
  calculation: SolarCalculation;
  aiRecommendation: string;
  generatedAt: string;
  creditsUsed: number;
  disclaimer: string;
}

export interface SolarAnalyzeResponse {
  status: 'success' | 'error';
  report?: SolarReport;
  error?: string;
}
