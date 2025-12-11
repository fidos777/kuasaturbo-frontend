"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import PlaygroundTabs from "@/components/playground/PlaygroundTabs";
import TaskSelector from "@/components/playground/TaskSelector";
import StyleSelector from "@/components/playground/StyleSelector";
import PersonaSelector from "@/components/playground/PersonaSelector";
import ImageUploader from "@/components/playground/ImageUploader";
import GenerateButton from "@/components/playground/GenerateButton";
import OutputDisplay from "@/components/playground/OutputDisplay";
import WorkerAnimation from "@/components/playground/WorkerAnimation";
import SolarForm from "@/components/solar/SolarForm";
import SolarReportDisplay from "@/components/solar/SolarReport";
import SolarLoading from "@/components/solar/SolarLoading";
import { generateCreative } from "@/lib/api";
import type { PlaygroundState, GenerateCreativeResponse } from "@/lib/types";
import type { SolarReport } from "@/lib/solar/types";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result as string; resolve(r.split(",")[1] || r); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<'creative' | 'solar'>('solar');
  
  // Creative state
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("default_creator");
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [creativeState, setCreativeState] = useState<PlaygroundState>("idle");
  const [currentWorker, setCurrentWorker] = useState(0);
  const [creativeResult, setCreativeResult] = useState<GenerateCreativeResponse | null>(null);
  
  // Solar state
  const [solarState, setSolarState] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [solarReport, setSolarReport] = useState<SolarReport | null>(null);

  const isProcessing = creativeState === "processing";
  const canGenerate = selectedTask && selectedStyle && !isProcessing;

  const handleCreativeGenerate = async () => {
    if (!canGenerate) return;
    setCreativeState("processing");
    setCurrentWorker(0);
    const interval = setInterval(() => setCurrentWorker((p) => (p < 3 ? p + 1 : p)), 800);
    try {
      const imageBase64 = uploadedImage ? await fileToBase64(uploadedImage) : undefined;
      const response = await generateCreative({ task: selectedTask, style: selectedStyle, prompt: prompt || undefined, image: imageBase64, persona_id: selectedPersona });
      clearInterval(interval);
      setCreativeResult(response);
      setCreativeState("complete");
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      setCreativeState("idle");
    }
  };

  const handleCreativeReset = () => { setCreativeState("idle"); setCreativeResult(null); setCurrentWorker(0); };

  const handleSolarSubmit = async (data: { monthlyBill: number; state: string; buildingType: 'residential' | 'commercial' | 'industrial'; useAI: boolean }) => {
    setSolarState('loading');
    try {
      const res = await fetch('/api/solar/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, useAI: data.useAI || false }) });
      const result = await res.json();
      if (result.status === 'success') { setSolarReport(result.report); setSolarState('complete'); }
      else throw new Error(result.error);
    } catch (e) { console.error(e); alert('Gagal menjana laporan'); setSolarState('idle'); }
  };

  const handleSolarReset = () => { setSolarState('idle'); setSolarReport(null); };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Microservices Playground</h1>
        <p className="text-xl text-slate-600">KuasaTurbo OS untuk Malaysian SME</p>
      </div>

      <PlaygroundTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'solar' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><span>⚡</span> Solar Feasibility Engine</h2>
              {solarState === 'idle' && <SolarForm onSubmit={handleSolarSubmit} isLoading={false} />}
              {solarState === 'loading' && <SolarLoading />}
              {solarState === 'complete' && <div className="text-center py-8"><div className="text-5xl mb-4">✅</div><h3 className="text-xl font-bold text-green-600">Laporan Sedia!</h3></div>}
            </Card>
          </div>
          <div>
            {solarState === 'idle' && <Card className="bg-slate-50"><div className="text-center py-12"><div className="text-5xl mb-4">☀️</div><h3 className="text-xl font-semibold text-slate-700 mb-2">Jana Laporan Solar</h3><p className="text-slate-500">Masukkan maklumat bil untuk analisis SEDA NEM 3.0</p></div></Card>}
            {solarState === 'loading' && <Card><SolarLoading /></Card>}
            {solarState === 'complete' && solarReport && <SolarReportDisplay report={solarReport} onReset={handleSolarReset} />}
          </div>
        </div>
      )}

      {activeTab === 'creative' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card><h2 className="text-lg font-semibold mb-4">1. Select Task</h2><TaskSelector selectedTask={selectedTask} onSelectTask={setSelectedTask} disabled={isProcessing} /></Card>
            <Card><h2 className="text-lg font-semibold mb-4">2. Choose Style</h2><StyleSelector selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} disabled={isProcessing} /></Card>
            <Card><h2 className="text-lg font-semibold mb-4">3. Choose Persona</h2><PersonaSelector selectedPersona={selectedPersona} onSelectPersona={setSelectedPersona} disabled={isProcessing} /></Card>
            <Card><h2 className="text-lg font-semibold mb-4">4. Add Prompt (Optional)</h2><input type="text" placeholder="Describe what you want..." value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isProcessing} className="w-full px-4 py-2 border rounded-lg" /></Card>
            <Card><h2 className="text-lg font-semibold mb-4">5. Upload Image (Optional)</h2><ImageUploader uploadedImage={uploadedImage} onUpload={setUploadedImage} disabled={isProcessing} /></Card>
            <GenerateButton onClick={handleCreativeGenerate} disabled={!canGenerate} isGenerating={isProcessing} />
          </div>
          <div>
            <Card className="sticky top-4">
              <h2 className="text-xl font-bold mb-6">Output</h2>
              {creativeState === "processing" && <WorkerAnimation currentStep={currentWorker} />}
              {creativeState === "complete" && creativeResult && <OutputDisplay output={creativeResult} onGenerateAnother={handleCreativeReset} />}
              {creativeState === "idle" && <div className="text-center py-12 text-slate-500">Select task and style to generate</div>}
            </Card>
          </div>
        </div>
      )}

      <div className="mt-12 text-center text-sm text-slate-500">Powered by KuasaTurbo • AI Microservices OS</div>
    </div>
  );
}
