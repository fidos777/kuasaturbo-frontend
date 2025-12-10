"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import Input from "@/components/shared/Input";
import TaskSelector from "@/components/playground/TaskSelector";
import StyleSelector from "@/components/playground/StyleSelector";
import ImageUploader from "@/components/playground/ImageUploader";
import GenerateButton from "@/components/playground/GenerateButton";
import OutputDisplay from "@/components/playground/OutputDisplay";
import WorkerAnimation from "@/components/playground/WorkerAnimation";
import { generateCreative } from "@/lib/api";
import type { PlaygroundState, GenerateCreativeResponse } from "@/lib/types";

// Helper: Convert File to Base64 string (client-side only)
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PlaygroundPage() {
  // Form state
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  // Execution state
  const [state, setState] = useState<PlaygroundState>("idle");
  const [currentWorker, setCurrentWorker] = useState<number>(0);
  const [result, setResult] = useState<GenerateCreativeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedTask || !selectedStyle) return;

    // Reset state
    setState("processing");
    setCurrentWorker(0);
    setResult(null);
    setError(null);

    // Simulate worker progression
    const workerInterval = setInterval(() => {
      setCurrentWorker((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      // Convert image to base64 if uploaded
      const imageBase64 = uploadedImage ? await fileToBase64(uploadedImage) : undefined;

      // Call API
      const response = await generateCreative({
        task: selectedTask,
        style: selectedStyle,
        prompt: prompt || undefined,
        image: imageBase64,
      });

      // Clear worker animation
      clearInterval(workerInterval);

      // Set result
      setResult(response);
      setState("complete");
    } catch (err) {
      clearInterval(workerInterval);
      setError(err instanceof Error ? err.message : "Generation failed");
      setState("error");
    }
  };

  const handleGenerateAnother = () => {
    setState("idle");
    setResult(null);
    setError(null);
    setCurrentWorker(0);
  };

  const handleReset = () => {
    setSelectedTask("");
    setSelectedStyle("");
    setPrompt("");
    setUploadedImage(null);
    setState("idle");
    setResult(null);
    setError(null);
    setCurrentWorker(0);
  };

  const isProcessing = state === "processing";
  const canGenerate = selectedTask && selectedStyle && !isProcessing;

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Creative Playground
          </h1>
          <p className="text-slate-600 text-lg">
            Try KuasaTurbo creative tasks. No API key required for demo.
          </p>
          {!process.env.NEXT_PUBLIC_API_URL && (
            <p className="text-orange-500 text-sm mt-2">
              Running in mock mode (NEXT_PUBLIC_API_URL not configured)
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Task Selection */}
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                1. Select Task
              </h2>
              <TaskSelector
                selectedTask={selectedTask}
                onSelectTask={setSelectedTask}
                disabled={isProcessing}
              />
            </Card>

            {/* Style Selection */}
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                2. Choose Style
              </h2>
              <StyleSelector
                selectedStyle={selectedStyle}
                onSelectStyle={setSelectedStyle}
                disabled={isProcessing}
              />
            </Card>

            {/* Prompt Input */}
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                3. Add Prompt (Optional)
              </h2>
              <Input
                placeholder="e.g., Create a vibrant thumbnail for car sale promo..."
                value={prompt}
                onChange={setPrompt}
                disabled={isProcessing}
              />
              <p className="text-xs text-slate-500 mt-2">
                Leave empty for default prompt based on task and style
              </p>
            </Card>

            {/* Image Upload */}
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                4. Upload Image (Optional)
              </h2>
              <ImageUploader
                uploadedImage={uploadedImage}
                onUpload={setUploadedImage}
                disabled={isProcessing}
              />
            </Card>

            {/* Generate Button */}
            <GenerateButton
              onClick={handleGenerate}
              disabled={!canGenerate}
              isGenerating={isProcessing}
            />
          </div>

          {/* Right Column - Output */}
          <div>
            <Card className="h-full min-h-[500px]">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Output
              </h2>

              {/* Worker Animation */}
              {isProcessing && (
                <WorkerAnimation currentStep={currentWorker} />
              )}

              {/* Error Display */}
              {state === "error" && error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={handleGenerateAnother}
                    className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Output Display */}
              {state === "complete" && result && (
                <OutputDisplay output={result} onGenerateAnother={handleReset} />
              )}

              {/* Idle State */}
              {state === "idle" && !result && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <span className="text-6xl mb-4">🎨</span>
                  <p>Select task and style, then click Generate to see results.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
