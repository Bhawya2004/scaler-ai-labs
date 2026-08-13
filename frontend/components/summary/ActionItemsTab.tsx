'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { ActionItem } from '@/lib/types';
import { api } from '@/lib/api';

interface ActionItemsTabProps {
  meetingId: string;
  actionItems: ActionItem[];
  onActionItemsChange: (items: ActionItem[]) => void;
}

export function ActionItemsTab({
  meetingId,
  actionItems,
  onActionItemsChange,
}: ActionItemsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Toggle item completion
  const handleToggle = async (id: string) => {
    // Optimistic update
    const updated = actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onActionItemsChange(updated);

    try {
      await api.toggleActionItem(id);
    } catch (err) {
      console.error('Toggle failed:', err);
      // Rollback on error
      onActionItemsChange(actionItems);
    }
  };

  // Add new action item
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setAdding(true);
    try {
      const created = await api.createActionItem(
        meetingId,
        newTask,
        newAssignee || 'Unassigned',
        newDueDate || ''
      );
      onActionItemsChange([...actionItems, created]);
      setNewTask('');
      setNewAssignee('');
      setNewDueDate('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create action item:', err);
    } finally {
      setAdding(false);
    }
  };

  // Delete action item
  const handleDelete = async (id: string) => {
    const updated = actionItems.filter((i) => i.id !== id);
    onActionItemsChange(updated);
    try {
      await api.deleteActionItem(id);
    } catch (err) {
      console.error('Failed to delete action item:', err);
      onActionItemsChange(actionItems);
    }
  };

  const filteredItems = actionItems.filter((item) => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const completedCount = actionItems.filter((i) => i.completed).length;

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700 dark:text-surface-300">
            Action Items ({completedCount}/{actionItems.length} Done)
          </h4>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 rounded-xl border border-surface-200 bg-surface-50 p-0.5 text-[11px] dark:border-surface-800 dark:bg-surface-900">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-2 py-0.5 font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-surface-900 shadow-xs dark:bg-surface-800 dark:text-white'
                : 'text-surface-500 hover:text-surface-800 dark:text-surface-400'
            }`}
          >
            All ({actionItems.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`rounded-lg px-2 py-0.5 font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-white text-surface-900 shadow-xs dark:bg-surface-800 dark:text-white'
                : 'text-surface-500 hover:text-surface-800 dark:text-surface-400'
            }`}
          >
            Pending ({actionItems.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`rounded-lg px-2 py-0.5 font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-white text-surface-900 shadow-xs dark:bg-surface-800 dark:text-white'
                : 'text-surface-500 hover:text-surface-800 dark:text-surface-400'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>
      </div>

      {/* Action Items Checklist */}
      {filteredItems.length === 0 && !showAddForm ? (
        <div className="rounded-2xl border border-dashed border-surface-200 p-8 text-center text-surface-400 dark:border-surface-800">
          <CheckCircle2 className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
          <p className="text-xs font-semibold text-surface-600 dark:text-surface-400">
            No action items in this filter
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                item.completed
                  ? 'border-emerald-200/60 bg-emerald-50/40 opacity-70 dark:border-emerald-950 dark:bg-emerald-950/20'
                  : 'border-surface-200 bg-white hover:border-brand-300 dark:border-surface-800 dark:bg-surface-900'
              }`}
            >
              {/* Checkbox & Task */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(item.id)}
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md transition-transform active:scale-90 ${
                    item.completed
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-surface-300 hover:border-brand-500 dark:border-surface-600'
                  }`}
                >
                  {item.completed && <CheckSquare className="h-3.5 w-3.5 stroke-[3]" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium leading-relaxed ${
                      item.completed
                        ? 'line-through text-surface-500 dark:text-surface-400'
                        : 'text-surface-900 dark:text-white'
                    }`}
                  >
                    {item.task}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-surface-500">
                    {item.assignee && (
                      <span className="flex items-center gap-1 font-semibold text-brand-700 dark:text-brand-300">
                        <User className="h-3 w-3" />
                        {item.assignee}
                      </span>
                    )}
                    {item.due_date && (
                      <span className="flex items-center gap-1 text-surface-400">
                        <Calendar className="h-3 w-3" />
                        Due: {item.due_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-surface-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                title="Delete action item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Action Item Inline Form */}
      {showAddForm ? (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4 dark:border-brand-900/40 dark:bg-brand-950/30 animate-slide-up"
        >
          <h5 className="text-xs font-bold text-surface-900 dark:text-white mb-2">New Action Item</h5>
          <div className="space-y-2.5">
            <input
              type="text"
              required
              placeholder="What task needs to be completed?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="h-8 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Assignee (e.g. Sarah)"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="h-8 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Due date (e.g. Friday 5pm)"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="h-8 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-surface-200 bg-white px-3 py-1.5 text-xs font-semibold text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span>Add Task</span>
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-surface-300 py-3 text-xs font-semibold text-surface-600 hover:border-brand-500 hover:text-brand-600 dark:border-surface-700 dark:text-surface-400 dark:hover:border-brand-400 dark:hover:text-brand-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Action Item</span>
        </button>
      )}
    </div>
  );
}
