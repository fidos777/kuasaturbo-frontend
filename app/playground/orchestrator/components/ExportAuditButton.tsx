'use client';

import { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { useWorkflowStore } from '@/store/workflowStore';

interface ExportAuditButtonProps {
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export default function ExportAuditButton({ canvasRef }: ExportAuditButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const {
    currentWorkflow,
    nodes,
    connections,
    calculateCostBreakdown,
  } = useWorkflowStore();

  const handleExport = async () => {
    if (!currentWorkflow) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const zip = new JSZip();

      // 1. workflow.json - serialized workflow store
      const workflowData = {
        workflow: {
          id: currentWorkflow.id,
          name: currentWorkflow.name,
          description: currentWorkflow.description,
          category: currentWorkflow.category,
          status: currentWorkflow.status,
          visibility: currentWorkflow.visibility,
          totalCost: currentWorkflow.totalCost,
          estimatedRevenue: currentWorkflow.estimatedRevenue,
          createdAt: currentWorkflow.createdAt,
          updatedAt: currentWorkflow.updatedAt,
          proofHash: currentWorkflow.proofHash,
          proposalId: currentWorkflow.proposalId,
          isApproved: currentWorkflow.isApproved,
          approvedAt: currentWorkflow.approvedAt,
          approvedBy: currentWorkflow.approvedBy,
        },
        nodes: nodes.map(node => ({
          id: node.id,
          taskId: node.taskId,
          position: node.position,
          parameters: node.parameters,
          status: node.status,
        })),
        connections: connections.map(conn => ({
          id: conn.id,
          sourceNode: conn.sourceNode,
          sourceHandle: conn.sourceHandle,
          targetNode: conn.targetNode,
          targetHandle: conn.targetHandle,
        })),
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      zip.file('workflow.json', JSON.stringify(workflowData, null, 2));

      // 2. cost.txt - total cost + breakdown
      const costBreakdown = calculateCostBreakdown();
      const costContent = `
================================================================================
COST BREAKDOWN REPORT
================================================================================
Generated: ${new Date().toISOString()}
Workflow: ${currentWorkflow.name}
================================================================================

TASK COSTS:
${costBreakdown.taskCosts.map(tc => `  - ${tc.taskId}: ${tc.taskName} = RM ${tc.cost.toFixed(2)}`).join('\n')}

--------------------------------------------------------------------------------
SUMMARY:
  Subtotal:        RM ${costBreakdown.subtotal.toFixed(2)}
  Execution (50%): RM ${costBreakdown.executionCost.toFixed(2)}
  Platform (30%):  RM ${costBreakdown.platformFee.toFixed(2)}
  Designer (20%):  RM ${costBreakdown.designerCut.toFixed(2)}
--------------------------------------------------------------------------------
TOTAL PER RUN:     RM ${costBreakdown.subtotal.toFixed(2)}
================================================================================
`.trim();
      zip.file('cost.txt', costContent);

      // 3. approval.txt - approvedAt + approvedBy
      const approvalContent = `
================================================================================
APPROVAL RECORD
================================================================================
Generated: ${new Date().toISOString()}
Workflow: ${currentWorkflow.name}
Workflow ID: ${currentWorkflow.id}
================================================================================

APPROVAL STATUS:
  Approved: ${currentWorkflow.isApproved ? 'YES' : 'NO'}
  ${currentWorkflow.isApproved ? `
  Approved At: ${currentWorkflow.approvedAt}
  Approved By: ${currentWorkflow.approvedBy}
  ` : `
  Status: AWAITING APPROVAL
  Note: This workflow has not been approved by a human.
  `}
--------------------------------------------------------------------------------
WORKFLOW STATUS: ${currentWorkflow.status?.toUpperCase() || 'DRAFT'}
${currentWorkflow.proofHash ? `PROOF HASH: ${currentWorkflow.proofHash}` : ''}
${currentWorkflow.proposalId ? `PROPOSAL ID: ${currentWorkflow.proposalId}` : ''}
================================================================================
`.trim();
      zip.file('approval.txt', approvalContent);

      // 4. screenshot.png - canvas capture
      // Try to capture the workflow canvas area
      const canvasElement = canvasRef?.current || document.querySelector('[data-audit-canvas]') || document.querySelector('main');

      if (canvasElement) {
        try {
          const canvas = await html2canvas(canvasElement as HTMLElement, {
            backgroundColor: '#1a1a2e',
            scale: 2,
            logging: false,
            useCORS: true,
          });

          const pngBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob || new Blob());
            }, 'image/png');
          });

          zip.file('screenshot.png', pngBlob);
        } catch (screenshotError) {
          console.warn('Screenshot capture failed:', screenshotError);
          // Add placeholder text file instead
          zip.file('screenshot_failed.txt', 'Screenshot capture failed. The canvas could not be rendered.');
        }
      } else {
        zip.file('screenshot_note.txt', 'No canvas element found for screenshot capture.');
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_${currentWorkflow.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || !currentWorkflow}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
        exportSuccess
          ? 'bg-green-600 text-white'
          : isExporting
          ? 'bg-gray-700 text-gray-400 cursor-wait'
          : currentWorkflow
          ? 'bg-amber-600 hover:bg-amber-700 text-white'
          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
      }`}
    >
      {exportSuccess ? (
        <>
          <CheckCircle size={16} />
          Exported!
        </>
      ) : isExporting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download size={16} />
          Export Audit
        </>
      )}
    </button>
  );
}
