import {
  SPECIFIC_YIELD_BY_REGION,
  STATE_TO_REGION,
  COST_BANDS,
  AVG_TARIFF_RATES,
  SELF_CONSUMPTION_RATIO,
  SYSTEM_PARAMS,
} from './constants';
import type { SolarInput, SolarCalculation } from './types';

export function getSpecificYield(state: string): number {
  const region = STATE_TO_REGION[state] || 'DEFAULT';
  return SPECIFIC_YIELD_BY_REGION[region] || SPECIFIC_YIELD_BY_REGION.DEFAULT;
}

export function getCostPerKwp(systemSizeKwp: number): number {
  for (const band of COST_BANDS) {
    if (systemSizeKwp <= band.maxKwp) {
      return band.costPerKwp;
    }
  }
  return COST_BANDS[COST_BANDS.length - 1].costPerKwp;
}

export function calculateSolarFeasibility(input: SolarInput): SolarCalculation {
  const { monthlyBill, state, buildingType } = input;
  
  const avgTariff = AVG_TARIFF_RATES[buildingType] || AVG_TARIFF_RATES.residential;
  const monthlyKwh = monthlyBill / avgTariff;
  const annualKwh = monthlyKwh * 12;
  const specificYield = getSpecificYield(state);
  
  const requiredKwp = (annualKwh * 0.80) / specificYield;
  const systemSizeKwp = Math.round(requiredKwp * 2) / 2;
  
  const panelCount = Math.ceil((systemSizeKwp * 1000) / SYSTEM_PARAMS.PANEL_WATT);
  const annualGenerationKwh = systemSizeKwp * specificYield;
  
  const selfConsumptionRatio = SELF_CONSUMPTION_RATIO[buildingType] || 0.60;
  const selfConsumptionKwh = annualGenerationKwh * selfConsumptionRatio;
  const exportToGridKwh = annualGenerationKwh * (1 - selfConsumptionRatio);
  
  const annualSavings = annualGenerationKwh * avgTariff;
  const monthlySavings = annualSavings / 12;
  
  const costPerKwp = getCostPerKwp(systemSizeKwp);
  const systemCost = systemSizeKwp * costPerKwp;
  
  const paybackYears = systemCost / annualSavings;
  
  let totalSavings = 0;
  for (let year = 1; year <= SYSTEM_PARAMS.SYSTEM_LIFESPAN_YEARS; year++) {
    const degradationFactor = Math.pow(1 - SYSTEM_PARAMS.ANNUAL_DEGRADATION, year);
    totalSavings += annualSavings * degradationFactor;
  }
  
  const billAfterSolar = Math.max(0, monthlyBill - monthlySavings);
  const co2AvoidedTons = (annualGenerationKwh * SYSTEM_PARAMS.CO2_PER_KWH) / 1000;
  const treesEquivalent = Math.round(co2AvoidedTons * SYSTEM_PARAMS.TREES_PER_TON_CO2);
  
  return {
    systemSizeKwp,
    panelCount,
    annualGenerationKwh: Math.round(annualGenerationKwh),
    selfConsumptionKwh: Math.round(selfConsumptionKwh),
    exportToGridKwh: Math.round(exportToGridKwh),
    currentMonthlyBill: Math.round(monthlyBill),
    billAfterSolar: Math.round(billAfterSolar),
    monthlySavings: Math.round(monthlySavings),
    annualSavings: Math.round(annualSavings),
    systemCost: Math.round(systemCost),
    paybackYears: Math.round(paybackYears * 10) / 10,
    twentyFiveYearSavings: Math.round(totalSavings),
    co2AvoidedTons: Math.round(co2AvoidedTons * 10) / 10,
    treesEquivalent,
  };
}
