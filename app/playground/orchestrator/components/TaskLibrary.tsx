'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { TASK_DEFINITIONS, TASK_CATEGORIES, getTasksByCategory } from '../data/tasks';
import { TaskDefinition } from '@/types/orchestrator';
import TaskCard from './TaskCard';

interface TaskLibraryProps {
  onViewTask: (task: TaskDefinition) => void;
  onAddTask: (task: TaskDefinition) => void;
}

export default function TaskLibrary({ onViewTask, onAddTask }: TaskLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = getTasksByCategory(selectedCategory).filter(task => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.name.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Task Library</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-button
              text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {TASK_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onView={() => onViewTask(task)}
              onAdd={() => onAddTask(task)}
            />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No tasks found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Drag hint */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/50">
        <p className="text-xs text-gray-400 text-center">
          💡 Drag tasks to the canvas or click &quot;Add&quot; to include in workflow
        </p>
      </div>
    </div>
  );
}
