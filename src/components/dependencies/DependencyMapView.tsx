import React, { useState, useMemo } from 'react';
import {
  Network,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Info,
  GitBranch,
  Layers,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';
import { ActionItem } from '../../types';

export const DependencyMapView: React.FC = () => {
  const { activeMeeting, updateTask, showToast, viewEvidenceFor } = useMeetFlow();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newDepSource, setNewDepSource] = useState<string>('');
  const [newDepTarget, setNewDepTarget] = useState<string>('');

  const tasks: ActionItem[] = activeMeeting?.actionItems || [];
  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  // Circular Dependency Detection using DFS
  const circularDependency = useMemo(() => {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    let cyclePath: string[] = [];

    function dfs(currentId: string, path: string[]): boolean {
      visited.add(currentId);
      recStack.add(currentId);

      const currentTask = taskMap.get(currentId);
      if (currentTask) {
        for (const depId of currentTask.dependencies) {
          if (!visited.has(depId)) {
            if (dfs(depId, [...path, depId])) return true;
          } else if (recStack.has(depId)) {
            cyclePath = [...path, depId];
            return true;
          }
        }
      }

      recStack.delete(currentId);
      return false;
    }

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        if (dfs(task.id, [task.id])) {
          return cyclePath;
        }
      }
    }
    return null;
  }, [tasks, taskMap]);

  // Classify tasks into dependency tiers
  const tiers = useMemo(() => {
    // Tier 1: Independent (no prerequisites)
    const tier1 = tasks.filter((t) => t.dependencies.length === 0);
    const tier1Ids = new Set(tier1.map((t) => t.id));

    // Tier 2: Directly depends on tier 1
    const tier2 = tasks.filter(
      (t) =>
        t.dependencies.length > 0 &&
        t.dependencies.every((dep) => tier1Ids.has(dep))
    );
    const tier2Ids = new Set(tier2.map((t) => t.id));

    // Tier 3: Depends on tier 2 or mixed
    const tier3 = tasks.filter(
      (t) =>
        !tier1Ids.has(t.id) &&
        !tier2Ids.has(t.id) &&
        t.dependencies.some((dep) => tier2Ids.has(dep))
    );
    const tier3Ids = new Set(tier3.map((t) => t.id));

    // Tier 4: Final downstream
    const tier4 = tasks.filter(
      (t) => !tier1Ids.has(t.id) && !tier2Ids.has(t.id) && !tier3Ids.has(t.id)
    );

    return [
      { name: 'Stage 1: Foundation Deliverables', subtitle: 'Independent prerequisites', tasks: tier1 },
      { name: 'Stage 2: Core Components', subtitle: 'Directly unblocked by Stage 1', tasks: tier2 },
      { name: 'Stage 3: Integration Milestones', subtitle: 'Requires multi-team handoffs', tasks: tier3 },
      { name: 'Stage 4: Verification & Delivery', subtitle: 'Downstream release testing', tasks: tier4 },
    ].filter((tier) => tier.tasks.length > 0);
  }, [tasks]);

  const handleAddDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepTarget || !newDepSource || newDepTarget === newDepSource) {
      showToast('Select two distinct tasks to link', 'error');
      return;
    }

    const targetTask = taskMap.get(newDepTarget);
    if (!targetTask) return;

    if (targetTask.dependencies.includes(newDepSource)) {
      showToast('Dependency link already exists', 'info');
      return;
    }

    const updatedTask: ActionItem = {
      ...targetTask,
      dependencies: [...targetTask.dependencies, newDepSource],
      status: targetTask.status === 'Completed' ? 'Completed' : 'Blocked',
    };

    updateTask(updatedTask);
    showToast(`Added dependency: ${targetTask.id} now depends on ${newDepSource}`);
    setNewDepSource('');
    setNewDepTarget('');
  };

  const handleRemoveDependency = (targetTaskId: string, depIdToRemove: string) => {
    const targetTask = taskMap.get(targetTaskId);
    if (!targetTask) return;

    const remainingDeps = targetTask.dependencies.filter((id) => id !== depIdToRemove);
    const updatedTask: ActionItem = {
      ...targetTask,
      dependencies: remainingDeps,
      status: remainingDeps.length === 0 && targetTask.status === 'Blocked' ? 'Pending' : targetTask.status,
    };

    updateTask(updatedTask);
    showToast(`Removed dependency ${depIdToRemove} from ${targetTaskId}`);
  };

  const selectedTask = selectedTaskId ? taskMap.get(selectedTaskId) : null;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Critical Path & Dependency Mapping
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                DAG Directed Graph
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Visualize sequential deliverables, identify bottlenecks, and resolve blocking dependencies.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Independent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Blocked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Prerequisite
          </span>
        </div>
      </div>

      {/* Circular Dependency Warning Banner */}
      {circularDependency && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 flex items-center gap-3 text-rose-700 dark:text-rose-300 animate-pulse">
          <AlertTriangle className="w-6 h-6 shrink-0 text-rose-500" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Circular Dependency Warning Detected!
            </h4>
            <p className="text-xs mt-0.5">
              Cycle detected in graph: <strong>{circularDependency.join(' → ')}</strong>. Circular dependencies will dead-lock team delivery. Please break the cycle below.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Dependency Flow Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier, tierIndex) => (
          <div
            key={tier.name}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {tier.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{tier.subtitle}</p>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {tier.tasks.length}
                </span>
              </div>

              {/* Tasks in this tier */}
              <div className="space-y-3 mt-3">
                {tier.tasks.map((task) => {
                  const isSelected = selectedTaskId === task.id;
                  const isBlocked = task.status === 'Blocked' || task.dependencies.length > 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/40'
                          : task.status === 'Blocked'
                          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 hover:border-rose-400'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {task.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            task.status === 'Blocked'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : task.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                        {task.title}
                      </h5>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{task.owner}</strong></span>
                        <span>Due: {task.dueDate}</span>
                      </div>

                      {/* Dependencies chips */}
                      {task.dependencies.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] text-slate-400">Blocked on:</span>
                          {task.dependencies.map((dep) => (
                            <span
                              key={dep}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold"
                            >
                              {dep}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {tierIndex < tiers.length - 1 && (
              <div className="hidden lg:flex items-center justify-center pt-2 text-slate-300 dark:text-slate-700">
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dependency Inspector & Relationship Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Task Relationship Inspector */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Task Dependency Inspector
            </h4>
            {selectedTask && (
              <button
                onClick={() => viewEvidenceFor(selectedTask, 'Task')}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                View Evidence
              </button>
            )}
          </div>

          {selectedTask ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedTask.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedTask.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedTask.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Assigned to: <strong>{selectedTask.owner}</strong> ({selectedTask.team})</span>
                  <span>Due: <strong>{selectedTask.dueDate}</strong></span>
                </div>
              </div>

              {/* Direct Prerequisites */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Prerequisites Required Before This Task Can Proceed ({selectedTask.dependencies.length})
                </h5>
                {selectedTask.dependencies.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                    This task has no prerequisites. Work can begin immediately!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedTask.dependencies.map((depId) => {
                      const depTask = taskMap.get(depId);
                      return (
                        <div
                          key={depId}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                              {depId}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                              {depTask?.title || 'External Deliverable'}
                            </span>
                            <span className="text-[10px] text-slate-400">({depTask?.owner})</span>
                          </div>
                          <button
                            onClick={() => handleRemoveDependency(selectedTask.id, depId)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            title="Remove dependency relationship"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Network className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
              Click any task card in the stages above to inspect its prerequisites and blocking relationships.
            </div>
          )}
        </div>

        {/* Add Relationship Form */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-purple-500" />
              Add Dependency Relationship
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Declare that Task B cannot begin until Task A has completed.
            </p>

            <form onSubmit={handleAddDependency} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  1. Prerequisite Task (Must complete first)
                </label>
                <select
                  value={newDepSource}
                  onChange={(e) => setNewDepSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select prerequisite task...</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id}: {t.title} ({t.owner})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center text-slate-400">
                <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  2. Dependent Task (Blocked until prerequisite finishes)
                </label>
                <select
                  value={newDepTarget}
                  onChange={(e) => setNewDepTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select dependent task...</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id}: {t.title} ({t.owner})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Connect Dependency Link
              </button>
            </form>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Sample Dependency Chain from Prompt:
            </span>
            <p>• Sneha Login API (TASK-102) → Sneha API Docs (TASK-103)</p>
            <p>• Priya Designs (TASK-101) & Sneha Docs (TASK-103) → Arjun Dashboard (TASK-104)</p>
            <p>• Arjun Dashboard (TASK-104) → Full Website Testing (TASK-105)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
