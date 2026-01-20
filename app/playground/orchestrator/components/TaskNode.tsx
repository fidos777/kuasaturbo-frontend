'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { getTaskById } from '../data/tasks';
import { WorkflowNode } from '@/types/orchestrator';
import { useWorkflowStore } from '@/store/workflowStore';

interface TaskNodeData {
  taskId: string;
  status: WorkflowNode['status'];
  nodeId: string;
}

interface TaskNodeProps {
  id: string;
  data: TaskNodeData;
  selected?: boolean;
}

function TaskNodeComponent({ id, data, selected }: TaskNodeProps) {
  const removeNode = useWorkflowStore(state => state.removeNode);
  const task = getTaskById(data.taskId);

  if (!task) return null;

  const statusColors = {
    idle: 'border-gray-500',
    running: 'border-primary animate-pulse-glow',
    completed: 'border-success',
    error: 'border-error',
  };

  const statusBg = {
    idle: 'bg-card',
    running: 'bg-primary/10',
    completed: 'bg-success/10',
    error: 'bg-error/10',
  };

  return (
    <div
      className={`
        relative w-[140px] rounded-card border-2 transition-all
        ${statusColors[data.status]}
        ${statusBg[data.status]}
        ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-500 !border-card hover:!bg-primary !w-3 !h-3"
      />

      {/* Content */}
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{task.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-primary font-mono">{task.id}</div>
            <div className="text-xs font-medium text-white truncate">{task.name}</div>
          </div>
        </div>

        {/* Cost */}
        <div className="text-[10px] text-secondary text-right font-medium">
          RM {task.avgCost.toFixed(2)}
        </div>

        {/* Status indicator */}
        {data.status !== 'idle' && (
          <div className={`
            absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[10px]
            ${data.status === 'running' ? 'bg-primary animate-pulse' : ''}
            ${data.status === 'completed' ? 'bg-success' : ''}
            ${data.status === 'error' ? 'bg-error' : ''}
          `}>
            {data.status === 'completed' && '✓'}
            {data.status === 'error' && '✕'}
            {data.status === 'running' && '⟳'}
          </div>
        )}

        {/* Delete button (shown when selected) */}
        {selected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNode(id);
            }}
            className="absolute -bottom-2 -right-2 w-6 h-6 bg-error rounded-full
              flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Trash2 size={12} className="text-white" />
          </button>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-500 !border-card hover:!bg-primary !w-3 !h-3"
      />
    </div>
  );
}

export default memo(TaskNodeComponent);
