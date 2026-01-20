'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_KUASATURBO_API_URL || 'https://kuasaturbo-api-production.up.railway.app';

export default function PlaygroundAPIPage() {
  const [screen, setScreen] = useState('submit');
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState<any>(null);
   const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

  const submitJob = async () => {
    setError(null);
    setScreen('processing');
    setProgress(10);

    try {
      const submitRes = await fetch(`${API_URL}/api/jobs/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_type: 'z4_format_transform',
          transform_type: 'mortgage_eligibility_summary',
          tenant_id: 'demo-tenant'
        })
      });

      const submitData = await submitRes.json();
      setJobId(submitData.job_id);
      setProgress(30);

      let attempts = 0;
      while (attempts < 30) {
        await new Promise(r => setTimeout(r, 1000));
        const statusRes = await fetch(`${API_URL}/api/jobs/${submitData.job_id}/status`);
        const statusData = await statusRes.json();
        setProgress(Math.min(30 + attempts * 2, 90));

        if (statusData.status === 'completed') {
          const resultRes = await fetch(`${API_URL}/api/jobs/${submitData.job_id}/result`);
          const resultData = await resultRes.json();
          setResult(resultData);
          setProgress(100);
          setScreen('result');
          return;
        }
        if (statusData.status === 'failed') throw new Error('Job failed');
        attempts++;
      }
      throw new Error('Job timed out');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');      setScreen('submit');
    }
  };

  const viewProof = async () => {
    if (!jobId) return;
    const proofRes = await fetch(`${API_URL}/api/jobs/${jobId}/proof`);
    const proofData = await proofRes.json();
    setResult((prev: any) => prev ? { ...prev, proof: proofData.proof } : null);
    setScreen('proof');
  };
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500">KuasaTurbo AI Playground API</h1>
          <p className="text-gray-400 mt-2">Layer 0 - Constitutional AI Execution - Non-Authoritative</p>
        </div>

        {screen === 'submit' && (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Submit Extraction Job</h2>
            <p className="text-gray-400 mb-6">This demo submits a z4_format_transform job.</p>
            {error && <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4"><p className="text-red-400">{error}</p></div>}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Job Type</p>
              <p className="font-mono">z4_format_transform</p>
              <p className="text-sm text-gray-500 mt-4 mb-2">Transform Type</p>
              <p className="font-mono">mortgage_eligibility_summary</p>
            </div>
            <button onClick={submitJob} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition">
              Submit Job
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center">This execution is NON-AUTHORITATIVE. Human review required.</p>
          </div>
        )}

        {screen === 'processing' && (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing...</h2>
            <p className="text-gray-400 mb-4">Job ID: {jobId}</p>
            <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-gray-500">{progress}%</p>
          </div>
        )}

        {screen === 'result' && result && (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-green-400">Job Completed</h2>
              <span className="text-sm text-gray-500">{result.duration_ms}ms</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-500">Tokens In</p><p className="text-2xl font-bold">{result.token_metrics?.tokens_in || 0}</p></div>
              <div className="bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-500">Tokens Out</p><p className="text-2xl font-bold">{result.token_metrics?.tokens_out || 0}</p></div>
              <div className="bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-500">Model</p><p className="text-sm font-mono">{result.token_metrics?.model_used || 'N/A'}</p></div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Output</p>
              <pre className="text-sm overflow-auto max-h-48">{JSON.stringify(result.outputs, null, 2)}</pre>
            </div>
            <div className="flex gap-4">
              <button onClick={viewProof} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition">View Proof Pack</button>
              <button onClick={() => { setScreen('submit'); setResult(null); setJobId(null); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition">New Job</button>
            </div>
          </div>
        )}

        {screen === 'proof' && result?.proof && (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">Proof Pack</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-500">Layer</p><p className="text-2xl font-bold">{result.proof.layer}</p></div>
              <div className="bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-500">Authoritative</p><p className="text-2xl font-bold text-red-400">NO</p></div>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 font-semibold">Non-Authoritative Output</p>
              <p className="text-sm text-yellow-200/70 mt-1">This proof pack is from KuasaTurbo (Layer 0). It is NOT a governance artifact until promoted to Qontrek.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Full Proof Pack</p>
              <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(result.proof, null, 2)}</pre>
            </div>
            <button onClick={() => setScreen('result')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition">Back to Result</button>
          </div>
        )}
      </div>
    </div>
  );
}
