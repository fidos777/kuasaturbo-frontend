'use client';

import { TaskDefinition } from '@/types/orchestrator';
import { X, AlertTriangle, Clock, Coins, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

interface TaskDetailModalProps {
  task: TaskDefinition;
  isOpen: boolean;
  onClose: () => void;
  onAddToFlow: () => void;
}

export default function TaskDetailModal({ task, isOpen, onClose, onAddToFlow }: TaskDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-gray-700 rounded-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{task.icon}</span>
            <div>
              <div className="text-xs text-primary font-mono">{task.id}</div>
              <h2 className="text-xl font-bold text-white">{task.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-button transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Description
            </h3>
            <p className="text-gray-300">{task.description}</p>
            {task.supportedFormats && (
              <p className="mt-2 text-sm text-gray-400">
                Supports: {task.supportedFormats.join(', ')}
              </p>
            )}
          </section>

          {/* Input/Output */}
          <div className="grid grid-cols-2 gap-4">
            <section className="bg-card rounded-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                <ArrowRight size={16} className="text-primary" />
                Input
              </h3>
              <ul className="space-y-2">
                {task.inputs.map((input, idx) => (
                  <li key={idx} className="text-sm">
                    <span className="text-white font-medium">{input.name}</span>
                    <span className="text-gray-500"> ({input.type})</span>
                    {input.required && <span className="text-error ml-1">*</span>}
                    <p className="text-xs text-gray-400 mt-0.5">{input.description}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-card rounded-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                <ArrowLeft size={16} className="text-success" />
                Output
              </h3>
              <ul className="space-y-2">
                {task.outputs.map((output, idx) => (
                  <li key={idx} className="text-sm">
                    <span className="text-white font-medium">{output.name}</span>
                    <span className="text-gray-500"> ({output.type})</span>
                    <p className="text-xs text-gray-400 mt-0.5">{output.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Economics */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Economics
            </h3>
            <div className="bg-card rounded-card p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                    <Coins size={14} />
                    Cost per run
                  </div>
                  <div className="text-secondary font-semibold">
                    RM {task.costRange.min.toFixed(2)}
                    {task.costRange.min !== task.costRange.max && ` - ${task.costRange.max.toFixed(2)}`}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                    <Zap size={14} />
                    Avg tokens
                  </div>
                  <div className="text-white font-semibold">
                    {task.avgTokens.min} - {task.avgTokens.max}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                    <Clock size={14} />
                    Avg duration
                  </div>
                  <div className="text-white font-semibold">
                    {task.avgDuration.min} - {task.avgDuration.max}s
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Success rate</div>
                  <div className={`font-semibold ${
                    task.successRate >= 95 ? 'text-success' :
                    task.successRate >= 90 ? 'text-warning' :
                    'text-error'
                  }`}>
                    {task.successRate}%
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Limitations - Constitutional */}
          <section className="bg-warning/10 border border-warning/30 rounded-card p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-warning uppercase tracking-wide mb-3">
              <AlertTriangle size={16} />
              Limitations
            </h3>
            <ul className="space-y-2">
              {task.limitations.map((limitation, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-warning mt-0.5">•</span>
                  {limitation}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t border-gray-700 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onAddToFlow();
              onClose();
            }}
            className="px-6 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-medium
              rounded-button transition-colors flex items-center gap-2"
          >
            <span>+ Add to Flow</span>
          </button>
        </div>
      </div>
    </div>
  );
}
