'use client';

import { useState } from 'react';
import { X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: () => void;
  workflowName: string;
}

export default function ApprovalModal({ isOpen, onClose, onApproved, workflowName }: ApprovalModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const { setApproval } = useWorkflowStore();

  const handleApprove = () => {
    if (!isChecked) return;
    setApproval(true);
    onApproved();
    onClose();
  };

  const handleCancel = () => {
    setIsChecked(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCancel} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-background border border-gray-700 rounded-card shadow-2xl">
        {/* Header - Design Constitution: Navy = Authority */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0B1B3A] flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Certification Required</h2>
                <p className="text-sm text-gray-400">Step 2 of 3</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-700 rounded-button transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Info Banner - Governance context */}
        <div className="bg-[#0B1B3A]/20 border-b border-[#1E3A5F]/50 px-4 py-3">
          <div className="flex items-start gap-2 text-gray-300 text-sm">
            <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-white" />
            <span>
              This workflow cannot run until certified.
              Your certification is required for governance compliance.
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 mb-2">
              Workflow to certify:
            </p>
            <div className="bg-card border border-gray-700 rounded-lg p-3">
              <p className="font-medium text-white">{workflowName || 'Untitled Workflow'}</p>
            </div>
          </div>

          {/* Certification Checkbox - Navy = Authority per Design Constitution */}
          <label className="flex items-start gap-3 cursor-pointer p-4 border border-[#1E3A5F] rounded-lg hover:border-[#0B1B3A] bg-[#0B1B3A]/10 transition-colors">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-[#0B1B3A] rounded"
            />
            <div>
              <p className="text-white font-medium">I certify this workflow for execution</p>
              <p className="text-sm text-gray-400 mt-1">
                I have reviewed this workflow and I authorize Qontrek to execute it.
              </p>
            </div>
          </label>
        </div>

        {/* Footer Actions - Navy = Authority for certification action */}
        <div className="border-t border-gray-700 p-4 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={!isChecked}
            className={`px-6 py-2 text-sm font-medium rounded-button transition-colors flex items-center gap-2 ${
              isChecked
                ? 'bg-[#0B1B3A] hover:bg-[#1E3A5F] text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShieldCheck size={16} />
            Certify Workflow
          </button>
        </div>
      </div>
    </div>
  );
}
