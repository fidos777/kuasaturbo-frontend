"use client";

import { useState } from 'react';
import { MALAYSIAN_STATES, BUILDING_TYPES } from '@/lib/solar/constants';

interface SolarFormProps {
  onSubmit: (data: { monthlyBill: number; state: string; buildingType: 'residential' | 'commercial' | 'industrial'; roofSize?: number; useAI: boolean; }) => void;
  isLoading: boolean;
}

export default function SolarForm({ onSubmit, isLoading }: SolarFormProps) {
  const [monthlyBill, setMonthlyBill] = useState('');
  const [state, setState] = useState('Selangor');
  const [buildingType, setBuildingType] = useState<'residential' | 'commercial' | 'industrial'>('residential');
  const [roofSize, setRoofSize] = useState('');
  const [useAI, setUseAI] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthlyBill || parseFloat(monthlyBill) <= 0) { alert('Sila masukkan bil bulanan'); return; }
    onSubmit({ monthlyBill: parseFloat(monthlyBill), state, buildingType, roofSize: roofSize ? parseFloat(roofSize) : undefined, useAI });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Bil Elektrik Bulanan (RM) <span className="text-red-500">*</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">RM</span>
          <input type="number" value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)} placeholder="450" min="50" required disabled={isLoading} className="w-full pl-14 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Negeri <span className="text-red-500">*</span></label>
        <select value={state} onChange={(e) => setState(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 bg-white">
          {MALAYSIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Bangunan <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-3 gap-3">
          {BUILDING_TYPES.map((type) => (
            <button key={type.id} type="button" onClick={() => setBuildingType(type.id as 'residential' | 'commercial' | 'industrial')} disabled={isLoading}
              className={`p-3 rounded-lg border-2 transition-all text-sm ${buildingType === type.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:border-slate-300'} disabled:opacity-50`}>
              <div className="font-medium">{type.id === 'residential' ? '🏠' : type.id === 'commercial' ? '🏢' : '🏭'}</div>
              <div className="mt-1">{type.label.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Saiz Bumbung (sq ft) <span className="text-slate-400">- Optional</span></label>
        <input type="number" value={roofSize} onChange={(e) => setRoofSize(e.target.value)} placeholder="1500" disabled={isLoading} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50" />
      </div>
      
      {/* AI Mode Toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-700 flex items-center gap-2">
              <span>🤖</span> AI Mode
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {useAI ? 'OpenAI akan menjana cadangan personalized' : 'Guna template cadangan standard'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUseAI(!useAI)}
            disabled={isLoading}
            className={`relative w-14 h-7 rounded-full transition-colors ${useAI ? 'bg-green-500' : 'bg-slate-300'} disabled:opacity-50`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${useAI ? 'translate-x-8' : 'translate-x-1'}`}></div>
          </button>
        </div>
        {useAI && (
          <div className="mt-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block">
            ⚡ +1 Credit untuk AI recommendation
          </div>
        )}
      </div>

      <button type="submit" disabled={isLoading || !monthlyBill} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-3">
        {isLoading ? (<><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Menganalisis...</span></>) : (<><span>⚡</span><span>Jana Laporan Solar</span></>)}
      </button>
      <div className="text-center text-sm text-slate-500">Kos: <span className="font-semibold text-orange-600">{useAI ? '5' : '4'} Credits (RM {useAI ? '5' : '4'})</span></div>
    </form>
  );
}
