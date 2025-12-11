import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SPECIFIC_YIELD: Record<string, number> = { PENINSULAR_WEST: 1350, PENINSULAR_EAST: 1400, SABAH: 1300, SARAWAK: 1250, DEFAULT: 1250 };
const STATE_REGION: Record<string, string> = { 'Selangor': 'PENINSULAR_WEST', 'Kuala Lumpur': 'PENINSULAR_WEST', 'Putrajaya': 'PENINSULAR_WEST', 'Perak': 'PENINSULAR_WEST', 'Penang': 'PENINSULAR_WEST', 'Kedah': 'PENINSULAR_WEST', 'Perlis': 'PENINSULAR_WEST', 'Melaka': 'PENINSULAR_WEST', 'Negeri Sembilan': 'PENINSULAR_WEST', 'Johor': 'PENINSULAR_WEST', 'Kelantan': 'PENINSULAR_EAST', 'Terengganu': 'PENINSULAR_EAST', 'Pahang': 'PENINSULAR_EAST', 'Sabah': 'SABAH', 'Sarawak': 'SARAWAK', 'Labuan': 'SABAH' };
const COST_BANDS = [{ max: 4, cost: 6000 }, { max: 12, cost: 4300 }, { max: 72, cost: 3600 }, { max: 200, cost: 3300 }, { max: 500, cost: 3000 }, { max: Infinity, cost: 2800 }];
const TARIFF: Record<string, number> = { residential: 0.45, commercial: 0.509, industrial: 0.365 };
const SELF_CONS: Record<string, number> = { residential: 0.60, commercial: 0.80, industrial: 0.90 };

function calculate(monthlyBill: number, state: string, buildingType: string) {
  const avgTariff = TARIFF[buildingType] || 0.45;
  const specificYield = SPECIFIC_YIELD[STATE_REGION[state] || 'DEFAULT'] || 1250;
  const annualKwh = (monthlyBill / avgTariff) * 12;
  const systemKwp = Math.round(((annualKwh * 0.8) / specificYield) * 2) / 2;
  const panelCount = Math.ceil((systemKwp * 1000) / 500);
  const annualGen = systemKwp * specificYield;
  const selfCons = annualGen * (SELF_CONS[buildingType] || 0.6);
  const exportGrid = annualGen - selfCons;
  const annualSavings = annualGen * avgTariff;
  const monthlySavings = annualSavings / 12;
  const costPerKwp = COST_BANDS.find(b => systemKwp <= b.max)?.cost || 2800;
  const systemCost = systemKwp * costPerKwp;
  const payback = systemCost / annualSavings;
  let total25 = 0;
  for (let y = 1; y <= 25; y++) total25 += annualSavings * Math.pow(0.995, y);
  const co2 = (annualGen * 0.78) / 1000;
  return {
    systemSizeKwp: systemKwp, panelCount, annualGenerationKwh: Math.round(annualGen),
    selfConsumptionKwh: Math.round(selfCons), exportToGridKwh: Math.round(exportGrid),
    currentMonthlyBill: Math.round(monthlyBill), billAfterSolar: Math.round(Math.max(0, monthlyBill - monthlySavings)),
    monthlySavings: Math.round(monthlySavings), annualSavings: Math.round(annualSavings),
    systemCost: Math.round(systemCost), paybackYears: Math.round(payback * 10) / 10,
    twentyFiveYearSavings: Math.round(total25), co2AvoidedTons: Math.round(co2 * 10) / 10,
    treesEquivalent: Math.round(co2 * 25)
  };
}

export async function POST(request: NextRequest) {
  try {
    const { monthlyBill, state, buildingType } = await request.json();
    if (!monthlyBill || monthlyBill <= 0) return NextResponse.json({ status: 'error', error: 'Invalid bill' }, { status: 400 });
    
    const calc = calculate(monthlyBill, state, buildingType);
    let aiRec = '';
    
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `You are a Malaysian solar consultant. Write 3 paragraphs in Bahasa Malaysia (under 120 words) for: ${state}, ${buildingType}, RM${calc.currentMonthlyBill}/month bill. System: ${calc.systemSizeKwp}kWp, ${calc.panelCount} panels. Savings: RM${calc.monthlySavings}/month, payback ${calc.paybackYears} years, 25-year savings RM${calc.twentyFiveYearSavings.toLocaleString()}. Be persuasive, mention NEM 3.0, end with call to book survey.`;
        const completion = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 300 });
        aiRec = completion.choices[0]?.message?.content || '';
      } catch { aiRec = ''; }
    }
    
    if (!aiRec) {
      aiRec = `Encik/Puan, berdasarkan bil elektrik anda RM ${calc.currentMonthlyBill} sebulan, kami cadangkan sistem solar ${calc.systemSizeKwp} kWp dengan ${calc.panelCount} panel.\n\nDengan pelaburan RM ${calc.systemCost.toLocaleString()}, anda boleh jimat RM ${calc.monthlySavings} setiap bulan. Tempoh bayar balik hanya ${calc.paybackYears} tahun, dan dalam 25 tahun, penjimatan mencecah RM ${calc.twentyFiveYearSavings.toLocaleString()}!\n\nProgram NEM 3.0 membolehkan lebihan tenaga dijual balik kepada TNB. Hubungi kami untuk site survey percuma.`;
    }
    
    return NextResponse.json({
      status: 'success',
      report: {
        input: { monthlyBill, state, buildingType },
        calculation: calc,
        aiRecommendation: aiRec,
        generatedAt: new Date().toISOString(),
        creditsUsed: 4,
        disclaimer: 'Calculation based on SEDA NEM 3.0 methodology. Actual results may vary.'
      }
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
