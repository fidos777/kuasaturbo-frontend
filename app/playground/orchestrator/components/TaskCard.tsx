'use client';

import { TaskDefinition } from '@/types/orchestrator';
import { Eye, Plus } from 'lucide-react';

interface TaskCardProps {
  task: TaskDefinition;
  onView: () => void;
  onAdd: () => void;
  isDragging?: boolean;
}

export default function TaskCard({ task, onView, onAdd, isDragging }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ taskId: task.id }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        bg-card rounded-card p-4 border-2 border-transparent
        hover:border-primary/50 hover:bg-card-hover
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{task.icon}</span>
        <div>
          <div className="text-xs text-gray-400 font-mono">{task.id}</div>
          <h3 className="text-sm font-semibold text-white">{task.name}</h3>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Cost:</span>
          <span className="text-secondary font-medium">
            RM {task.costRange.min.toFixed(2)}
            {task.costRange.min !== task.costRange.max && ` - ${task.costRange.max.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Success:</span>
          <span className={`font-medium ${
            task.successRate >= 95 ? 'text-success' :
            task.successRate >= 90 ? 'text-warning' :
            'text-error'
          }`}>
            {task.successRate}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs
            bg-gray-700 hover:bg-gray-600 rounded-button transition-colors"
        >
          <Eye size={14} />
          View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs
            bg-primary hover:bg-primary-600 rounded-button transition-colors font-medium"
        >
          <Plus size={14} />
          Add
        </button>
      </div>
    </div>
  );
}
