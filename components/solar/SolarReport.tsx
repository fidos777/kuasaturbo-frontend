"use client";

import { useState } from 'react';
import type { SolarReport } from '@/lib/solar/types';

interface SolarReportProps {
  report: SolarReport;
  onReset: () => void;
}

export default function SolarReportDisplay({ report, onReset }: SolarReportProps) {
  const [copied, setCopied] = useState(false);
  const { input, calculation, aiRecommendation, disclaimer } = report;

  // Calculate feasibility score (based on payback period)
  const feasibilityScore = calculation.paybackYears <= 5 ? 95 : calculation.paybackYears <= 7 ? 88 : calculation.paybackYears <= 10 ? 75 : 60;
  const feasibilityLabel = feasibilityScore >= 90 ? 'Sangat Tinggi' : feasibilityScore >= 80 ? 'Tinggi' : feasibilityScore >= 70 ? 'Sederhana' : 'Rendah';

  const handleCopyToWhatsApp = () => {
    const message = `⚡ *LAPORAN FEASIBILITY SOLAR*\n━━━━━━━━━━━━━━━━━━━━━\n\n📍 *Lokasi:* ${input.state}\n🏠 *Jenis:* ${input.buildingType === 'residential' ? 'Kediaman' : input.buildingType === 'commercial' ? 'Komersial' : 'Industri'}\n💡 *Bil Semasa:* RM ${calculation.currentMonthlyBill}/bulan\n\n⚡ *SISTEM DISYORKAN*\n• Saiz: ${calculation.systemSizeKwp} kWp\n• Panel: ${calculation.panelCount} unit (500W)\n\n💰 *ANALISIS KEWANGAN*\n• Penjimatan Bulanan: RM ${calculation.monthlySavings}\n• Tempoh Bayar Balik: ${calculation.paybackYears} tahun\n• Penjimatan 25 Tahun: RM ${calculation.twentyFiveYearSavings.toLocaleString()}\n\n🎯 *Skor Feasibility: ${feasibilityScore}% (${feasibilityLabel})*\n\n✅ Kiraan berdasarkan SEDA NEM 3.0`;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookSurvey = () => {
    const msg = encodeURIComponent(`Salam, saya berminat untuk solar. Bil elektrik saya RM${calculation.currentMonthlyBill}/bulan. Sistem dicadangkan: ${calculation.systemSizeKwp}kWp. Boleh book site survey?`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleShare = () => {
    const msg = encodeURIComponent(`⚡ Analisis Solar saya:\n\n💰 Jimat RM${calculation.monthlySavings}/bulan\n⚡ Sistem ${calculation.systemSizeKwp}kWp\n📈 Payback ${calculation.paybackYears} tahun\n🎯 Skor: ${feasibilityScore}%\n\nCuba di kuasaturbo.com/playground`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with Feasibility Score */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <h2 className="text-xl font-bold">Laporan Feasibility Solar</h2>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            🎯 {feasibilityScore}% {feasibilityLabel}
          </div>
        </div>
        <p className="text-orange-100 text-sm">Powered by KuasaTurbo • SEDA NEM 3.0</p>
      </div>

      {/* Feasibility Score Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-700">🎯 Skor Feasibility</span>
          <span className="text-2xl font-bold text-orange-600">{feasibilityScore}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${feasibilityScore >= 90 ? 'bg-green-500' : feasibilityScore >= 80 ? 'bg-green-400' : feasibilityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${feasibilityScore}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {feasibilityScore >= 90 ? '✅ Sangat sesuai untuk pemasangan solar' : 
           feasibilityScore >= 80 ? '✅ Sesuai untuk pemasangan solar' :
           feasibilityScore >= 70 ? '⚠️ Boleh dipertimbangkan' : '⚠️ Perlu kajian lanjut'}
        </p>
      </div>

      {/* Customer Info */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h3 className="font-semibold text-slate-700 mb-3">📍 Maklumat Pelanggan</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><div className="text-slate-500">Lokasi</div><div className="font-medium">{input.state}</div></div>
          <div><div className="text-slate-500">Jenis</div><div className="font-medium capitalize">{input.buildingType === 'residential' ? 'Kediaman' : input.buildingType === 'commercial' ? 'Komersial' : 'Industri'}</div></div>
          <div><div className="text-slate-500">Bil Semasa</div><div className="font-medium">RM {calculation.currentMonthlyBill}/bulan</div></div>
        </div>
      </div>

      {/* System Recommendation */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg">
        <h3 className="font-semibold text-slate-700 mb-3">⚡ Sistem Disyorkan</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-3xl font-bold text-orange-600">{calculation.systemSizeKwp}</div>
            <div className="text-sm text-slate-600">kWp</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-3xl font-bold text-orange-600">{calculation.panelCount}</div>
            <div className="text-sm text-slate-600">Panel (500W)</div>
          </div>
        </div>
      </div>

      {/* Financial Analysis */}
      <div className="bg-white border border-green-200 p-4 rounded-lg">
        <h3 className="font-semibold text-slate-700 mb-3">💰 Analisis Kewangan</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b"><span>Bil Semasa</span><span className="font-medium">RM {calculation.currentMonthlyBill}/bulan</span></div>
          <div className="flex justify-between py-2 border-b"><span>Bil Selepas Solar</span><span className="font-medium text-green-600">RM {calculation.billAfterSolar}/bulan</span></div>
          <div className="flex justify-between py-2 border-b bg-green-50 -mx-4 px-4"><span className="text-green-700 font-medium">Penjimatan Bulanan</span><span className="font-bold text-green-600 text-lg">RM {calculation.monthlySavings}</span></div>
          <div className="flex justify-between py-2 border-b"><span>Penjimatan Tahunan</span><span className="font-medium">RM {calculation.annualSavings.toLocaleString()}</span></div>
          <div className="flex justify-between py-2 border-b"><span>Kos Sistem</span><span className="font-medium">RM {calculation.systemCost.toLocaleString()}</span></div>
          <div className="flex justify-between py-2 border-b"><span>Tempoh Bayar Balik</span><span className="font-bold text-orange-600">{calculation.paybackYears} tahun</span></div>
          <div className="flex justify-between py-2 bg-orange-50 -mx-4 px-4"><span className="text-orange-700 font-medium">Penjimatan 25 Tahun</span><span className="font-bold text-orange-600 text-xl">RM {calculation.twentyFiveYearSavings.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-white border border-green-200 p-4 rounded-lg">
        <h3 className="font-semibold text-slate-700 mb-3">🌱 Impak Alam Sekitar</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{calculation.co2AvoidedTons}</div>
            <div className="text-sm text-slate-600">tan CO₂/tahun</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{calculation.treesEquivalent}</div>
            <div className="text-sm text-slate-600">pokok setara</div>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-semibold text-slate-700 mb-3">🤖 AI Consultant Recommendation</h3>
        <div className="bg-white p-4 rounded-lg text-slate-700 leading-relaxed whitespace-pre-line">{aiRecommendation}</div>
      </div>

      {/* Action Buttons - Malaysian-friendly labels */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={handleCopyToWhatsApp} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
          <span>📋</span><span>{copied ? 'Disalin!' : 'Salin'}</span>
        </button>
        <button onClick={handleBookSurvey} className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
          <span>📞</span><span>Tempah Survey</span>
        </button>
        <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
          <span>💬</span><span>Hantar</span>
        </button>
      </div>

      {/* SEDA Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs text-slate-500">
        <div className="flex items-start gap-2"><span>✅</span><div><strong>SEDA NEM 3.0 Methodology</strong><p className="mt-1">{disclaimer}</p></div></div>
      </div>

      {/* Credit Info */}
      <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg text-sm">
        <span>Credits Used: <strong className="text-orange-600">4</strong></span>
        <span>Balance: <strong className="text-orange-600">96 Credits</strong></span>
      </div>

      {/* Teams Mode Hint - Seeds Qontrek */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 p-4 rounded-lg text-center">
        <p className="text-sm text-slate-600">
          🚀 <strong>Teams Mode Coming Soon</strong> — Kongsi laporan, kredit & lead antara team members
        </p>
      </div>

      {/* Generate Another */}
      <button onClick={onReset} className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-medium py-3 px-6 rounded-lg transition-colors">Jana Laporan Baru</button>
    </div>
  );
}
