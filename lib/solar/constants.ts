// SEDA-Aligned Solar Constants for Malaysia

export const SPECIFIC_YIELD_BY_REGION: Record<string, number> = {
  PENINSULAR_WEST: 1350,
  PENINSULAR_EAST: 1400,
  SABAH: 1300,
  SARAWAK: 1250,
  DEFAULT: 1250,
};

export const STATE_TO_REGION: Record<string, string> = {
  'Selangor': 'PENINSULAR_WEST',
  'Kuala Lumpur': 'PENINSULAR_WEST',
  'Putrajaya': 'PENINSULAR_WEST',
  'Perak': 'PENINSULAR_WEST',
  'Penang': 'PENINSULAR_WEST',
  'Kedah': 'PENINSULAR_WEST',
  'Perlis': 'PENINSULAR_WEST',
  'Melaka': 'PENINSULAR_WEST',
  'Negeri Sembilan': 'PENINSULAR_WEST',
  'Johor': 'PENINSULAR_WEST',
  'Kelantan': 'PENINSULAR_EAST',
  'Terengganu': 'PENINSULAR_EAST',
  'Pahang': 'PENINSULAR_EAST',
  'Sabah': 'SABAH',
  'Sarawak': 'SARAWAK',
  'Labuan': 'SABAH',
};

export const COST_BANDS = [
  { maxKwp: 4, costPerKwp: 6000 },
  { maxKwp: 12, costPerKwp: 4300 },
  { maxKwp: 72, costPerKwp: 3600 },
  { maxKwp: 200, costPerKwp: 3300 },
  { maxKwp: 500, costPerKwp: 3000 },
  { maxKwp: Infinity, costPerKwp: 2800 },
];

export const AVG_TARIFF_RATES: Record<string, number> = {
  residential: 0.45,
  commercial: 0.509,
  industrial: 0.365,
};

export const SELF_CONSUMPTION_RATIO: Record<string, number> = {
  residential: 0.60,
  commercial: 0.80,
  industrial: 0.90,
};

export const SYSTEM_PARAMS = {
  PANEL_WATT: 500,
  SYSTEM_LIFESPAN_YEARS: 25,
  ANNUAL_DEGRADATION: 0.005,
  CO2_PER_KWH: 0.78,
  TREES_PER_TON_CO2: 25,
};

export const MALAYSIAN_STATES = [
  'Selangor', 'Kuala Lumpur', 'Johor', 'Penang', 'Perak',
  'Pahang', 'Negeri Sembilan', 'Melaka', 'Kedah', 'Kelantan',
  'Terengganu', 'Perlis', 'Sabah', 'Sarawak', 'Putrajaya', 'Labuan',
];

export const BUILDING_TYPES = [
  { id: 'residential', label: 'Residential (Rumah)' },
  { id: 'commercial', label: 'Commercial (Kedai/Pejabat)' },
  { id: 'industrial', label: 'Industrial (Kilang)' },
];

export const SEDA_DISCLAIMER = `Calculation based on SEDA NEM 3.0 methodology. Specific yield data derived from Malaysian irradiance studies. Cost estimates based on SEDA NEM Calculator reference rates. Actual results may vary.`;
