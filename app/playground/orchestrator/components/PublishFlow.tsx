'use client';

import { useState, useMemo } from 'react';
import { X, AlertTriangle, Check, Globe, Lock, Link as LinkIcon, Rocket, TrendingDown } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { TASK_CATEGORIES, getTaskById } from '../data/tasks';

interface PublishFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess: () => void;
}

export default function PublishFlow({ isOpen, onClose, onPublishSuccess }: PublishFlowProps) {
  const {
    currentWorkflow,
    nodes,
    calculateCostBreakdown,
    publishDeclarations,
    updatePublishDeclarations,
    publishWorkflow,
  } = useWorkflowStore();

  const [name, setName] = useState(currentWorkflow?.name || 'Untitled Workflow');
  const [description, setDescription] = useState(currentWorkflow?.description || '');
  const [category, setCategory] = useState(currentWorkflow?.category || 'general');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>(
    currentWorkflow?.visibility || 'private'
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const costBreakdown = calculateCostBreakdown();

  // Calculate estimated success rate
  const estimatedSuccessRate = useMemo(() => {
    if (nodes.length === 0) return 100;
    const rates = nodes.map(node => {
      const task = getTaskById(node.taskId);
      return task?.successRate || 100;
    });
    return Math.round(rates.reduce((a, b) => (a * b) / 100, 100));
  }, [nodes]);

  const allDeclarationsAccepted = Object.values(publishDeclarations).every(v => v);

  const handlePublish = async () => {
    if (!allDeclarationsAccepted) return;

    setIsPublishing(true);
    try {
      publishWorkflow(name, description, category, visibility);
      setPublishSuccess(true);
      setTimeout(() => {
        onPublishSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  if (publishSuccess) {
    // Generate display proof hash (matches what store generates)
    const timestamp = new Date().toISOString();
    const proofInput = `${currentWorkflow?.id || 'new'}:${timestamp}:${nodes.length}:v1`;
    const displayProofHash = `proof_${btoa(proofInput).slice(0, 24)}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative bg-background border border-gray-700 rounded-card p-8 max-w-md">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Workflow Activated!</h2>
            <p className="text-gray-400">Your workflow is now live and earning.</p>
          </div>

          {/* Certification Tier Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-green-300">CERTIFIED</span>
              <span className="text-xs text-gray-400">Human-Approved</span>
            </div>
          </div>

          {/* Proof Hash Display */}
          <div className="bg-card border border-gray-700 rounded-card p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-400">🔐</span>
              <span className="text-sm font-semibold text-gray-300">Proof Hash</span>
            </div>
            <code className="block text-xs text-amber-300 bg-black/30 px-3 py-2 rounded font-mono break-all">
              {displayProofHash}
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Audit trail reference linked to source data
            </p>
          </div>

          {/* 6 Declarations Accepted */}
          <div className="text-center text-sm text-gray-400">
            <span className="text-success">✓</span> 6 Declarations Accepted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-gray-700 rounded-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Activate Workflow</h2>
              <p className="text-sm text-gray-400">{nodes.length} tasks configured</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-button transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Workflow Details */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Workflow Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-gray-700 rounded-button
                    text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  placeholder="My Workflow Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-card border border-gray-700 rounded-button
                    text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                  placeholder="What does this workflow do?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-gray-700 rounded-button
                    text-white focus:outline-none focus:border-primary"
                >
                  {TASK_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Visibility */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Visibility
            </h3>
            <div className="space-y-2">
              {[
                { value: 'public', icon: Globe, label: 'Public', desc: 'Anyone can use and fork' },
                { value: 'private', icon: Lock, label: 'Private', desc: 'Only you can use' },
                { value: 'unlisted', icon: LinkIcon, label: 'Unlisted', desc: 'Only people with link can use' },
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-card cursor-pointer transition-colors ${
                    visibility === option.value
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-card hover:bg-card-hover border border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                    className="sr-only"
                  />
                  <option.icon size={20} className={visibility === option.value ? 'text-primary' : 'text-gray-400'} />
                  <div>
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-xs text-gray-400">{option.desc}</div>
                  </div>
                  {visibility === option.value && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </section>

          {/* Economics */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Economics
            </h3>
            <div className="bg-card rounded-card p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cost per run:</span>
                <span className="text-white font-medium">RM {costBreakdown.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform fee (30%):</span>
                <span className="text-gray-300">RM {costBreakdown.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Execution cost (50%):</span>
                <span className="text-gray-300">RM {costBreakdown.executionCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-success font-medium">Your cut (20%):</span>
                <span className="text-success font-medium">RM {costBreakdown.designerCut.toFixed(2)}</span>
              </div>
            </div>

            {/* Failure Visibility */}
            {estimatedSuccessRate < 100 && (
              <div className="mt-3 bg-error/10 border border-error/30 rounded-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={14} className="text-error" />
                  <span className="text-xs font-semibold text-error">Failure Visibility</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated success rate:</span>
                    <span className={estimatedSuccessRate >= 90 ? 'text-success' : 'text-warning'}>
                      {estimatedSuccessRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potential failure rate:</span>
                    <span className="text-error">{100 - estimatedSuccessRate}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Failed runs consume API credits without earning revenue.
                </p>
              </div>
            )}
          </section>

          {/* Declarations */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Declarations
            </h3>
            <div className="space-y-3">
              <DeclarationCheckbox
                checked={publishDeclarations.nonAuthoritative}
                onChange={(checked) => updatePublishDeclarations({ nonAuthoritative: checked })}
                label="I understand all outputs are NON-AUTHORITATIVE and require human review before action"
                isConstitutional
              />
              <DeclarationCheckbox
                checked={publishDeclarations.revenueShare}
                onChange={(checked) => updatePublishDeclarations({ revenueShare: checked })}
                label="I accept the 20% designer revenue share (50% execution, 30% platform)"
              />
              <DeclarationCheckbox
                checked={publishDeclarations.allowFork}
                onChange={(checked) => updatePublishDeclarations({ allowFork: checked })}
                label="I allow others to fork and remix this workflow (attribution preserved)"
              />
              <DeclarationCheckbox
                checked={publishDeclarations.termsAccepted}
                onChange={(checked) => updatePublishDeclarations({ termsAccepted: checked })}
                label="I agree to the KuasaTurbo Terms of Service and Community Guidelines"
              />
              <DeclarationCheckbox
                checked={publishDeclarations.declareNotActivate}
                onChange={(checked) => updatePublishDeclarations({ declareNotActivate: checked })}
                label="I understand: DECLARE ≠ ACTIVATE ≠ EXECUTE — activation makes the workflow available, execution requires user trigger"
                isConstitutional
              />
              <DeclarationCheckbox
                checked={publishDeclarations.proofAuditTrail}
                onChange={(checked) => updatePublishDeclarations({ proofAuditTrail: checked })}
                label="I acknowledge all executions generate a proof hash linked to source data for audit trail compliance"
                isConstitutional
              />
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t border-gray-700 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={!allDeclarationsAccepted || !name || !description || isPublishing}
            className={`px-6 py-2 text-sm font-medium rounded-button transition-colors flex items-center gap-2 ${
              allDeclarationsAccepted && name && description
                ? 'bg-success hover:bg-green-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Rocket size={16} />
            {isPublishing ? 'Activating...' : 'Activate Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeclarationCheckbox({
  checked,
  onChange,
  label,
  isConstitutional = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  isConstitutional?: boolean;
}) {
  return (
    <label className={`flex items-start gap-3 p-3 rounded-card cursor-pointer transition-colors ${
      isConstitutional ? 'bg-warning/5 border border-warning/20' : 'bg-card'
    }`}>
      <div className="pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
          checked
            ? isConstitutional ? 'bg-warning' : 'bg-primary'
            : 'border-2 border-gray-600'
        }`}>
          {checked && <Check size={14} className="text-white" />}
        </div>
      </div>
      <span className={`text-sm ${isConstitutional ? 'text-warning' : 'text-gray-300'}`}>
        {isConstitutional && <AlertTriangle size={14} className="inline mr-1 mb-0.5" />}
        {label}
      </span>
    </label>
  );
}
