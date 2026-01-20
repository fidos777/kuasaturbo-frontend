"use client";

import { useEffect, useState } from 'react';

const STEPS = [
  { icon: '📊', text: 'Menganalisis bil elektrik...' },
  { icon: '☀️', text: 'Mengira irradiance solar...' },
  { icon: '⚡', text: 'Menentukan saiz sistem optimum...' },
  { icon: '💰', text: 'Mengira penjimatan & ROI...' },
  { icon: '🤖', text: 'AI menjana cadangan...' },
];

export default function SolarLoading() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setStep((p) => (p + 1) % STEPS.length), 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-orange-400 rounded-full animate-pulse flex items-center justify-center">
          <span className="text-4xl">☀️</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-4xl mb-4">{STEPS[step].icon}</div>
        <div className="text-lg font-medium text-slate-700">{STEPS[step].text}</div>
      </div>
      <div className="flex gap-2 mt-6">
        {STEPS.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-orange-500 scale-125' : 'bg-slate-300'}`} />))}
      </div>
      <div className="mt-8 text-sm text-slate-500 flex items-center gap-2">
        <span>📊</span><span>Kiraan berdasarkan SEDA NEM 3.0</span>
      </div>
    </div>
  );
}
