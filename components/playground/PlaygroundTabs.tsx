"use client";

interface PlaygroundTabsProps {
  activeTab: 'creative' | 'solar';
  onTabChange: (tab: 'creative' | 'solar') => void;
}

export default function PlaygroundTabs({ activeTab, onTabChange }: PlaygroundTabsProps) {
  return (
    <div className="flex gap-2 mb-8 border-b border-slate-200">
      <button
        onClick={() => onTabChange('solar')}
        className={`px-6 py-4 text-left transition-all border-b-2 -mb-[2px] ${activeTab === 'solar' ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <div className={`font-semibold ${activeTab === 'solar' ? 'text-orange-600' : 'text-slate-700'}`}>Solar Engine</div>
            <div className="text-xs text-slate-500">Feasibility & Proposal AI</div>
          </div>
        </div>
      </button>
      <button
        onClick={() => onTabChange('creative')}
        className={`px-6 py-4 text-left transition-all border-b-2 -mb-[2px] ${activeTab === 'creative' ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <div>
            <div className={`font-semibold ${activeTab === 'creative' ? 'text-orange-600' : 'text-slate-700'}`}>Creative Engine</div>
            <div className="text-xs text-slate-500">Marketing AI</div>
          </div>
        </div>
      </button>
      <div className="px-6 py-4 opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚗</span>
          <div>
            <div className="font-semibold text-slate-400">Automotive</div>
            <div className="text-xs text-slate-400">Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
