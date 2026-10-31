import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX,
  ArrowRight,
  Sparkles,
  Edit3,
  Calendar,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';
import { ActionItem, TaskStatus } from '../../types';

export const TeamAccountabilityView: React.FC = () => {
  const { meetings, updateTask, viewEvidenceFor, showToast } = useMeetFlow();

  const [selectedMember, setSelectedMember] = useState<string>('ALL');
  const [reassigningTask, setReassigningTask] = useState<ActionItem | null>(null);
  const [newOwnerName, setNewOwnerName] = useState('');

  const allTasks: ActionItem[] = meetings.flatMap((m) => m.actionItems);
  const todayStr = '2026-11-02';

  const teamRoster = [
    { name: 'Rahul', role: 'Project Manager', email: 'rahul@meetflow.internal' },
    { name: 'Priya', role: 'UI/UX Designer', email: 'priya@meetflow.internal' },
    { name: 'Arjun', role: 'Frontend Developer', email: 'arjun@meetflow.internal' },
    { name: 'Sneha', role: 'Backend Developer', email: 'sneha@meetflow.internal' },
    { name: 'Unassigned', role: 'Responsibility Gap', email: 'unassigned@meetflow.internal' },
  ];

  const memberStats = teamRoster.map((member) => {
    const assignedTasks = allTasks.filter(
      (t) => t.owner.toLowerCase() === member.name.toLowerCase()
    );
    const completed = assignedTasks.filter((t) => t.status === 'Completed').length;
    const inProgress = assignedTasks.filter((t) => t.status === 'In Progress').length;
    const blocked = assignedTasks.filter((t) => t.status === 'Blocked').length;
    const pending = assignedTasks.filter((t) => t.status === 'Pending').length;
    const overdue = assignedTasks.filter(
      (t) => t.status !== 'Completed' && t.dueDate !== 'Not specified' && t.dueDate < todayStr
    ).length;
    const completionPct =
      assignedTasks.length > 0 ? Math.round((completed / assignedTasks.length) * 100) : 0;

    return {
      ...member,
      assignedTasks,
      total: assignedTasks.length,
      completed,
      inProgress,
      blocked,
      pending,
      overdue,
      completionPct,
    };
  });

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningTask || !newOwnerName) return;

    updateTask({
      ...reassigningTask,
      owner: newOwnerName,
    });
    showToast(`Reassigned ${reassigningTask.id} to ${newOwnerName}`);
    setReassigningTask(null);
    setNewOwnerName('');
  };

  const displayedMembers =
    selectedMember === 'ALL'
      ? memberStats
      : memberStats.filter((m) => m.name.toLowerCase() === selectedMember.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Team Accountability & Workload Balance
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Monitor ownership distribution, individual velocity, and unassigned commitments across sprint deliverables.
            </p>
          </div>
        </div>

        {/* Member filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedMember('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedMember === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Members
          </button>
          {teamRoster.map((m) => (
            <button
              key={m.name}
              onClick={() => setSelectedMember(m.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedMember === m.name
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedMembers.map((member) => {
          const isUnassigned = member.name === 'Unassigned';

          return (
            <div
              key={member.name}
              className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all bg-white dark:bg-slate-900 ${
                isUnassigned && member.total > 0
                  ? 'border-amber-400 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Member Profile Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-md ${
                        isUnassigned
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500'
                      }`}
                    >
                      {isUnassigned ? '?' : member.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-400">{member.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isUnassigned
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : member.completionPct >= 70
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {member.completionPct}% Done
                  </span>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 mb-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <strong className="text-slate-900 dark:text-white font-extrabold">{member.total}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-500 block">Done</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{member.completed}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-500 block">Active</span>
                    <strong className="text-amber-600 dark:text-amber-400 font-extrabold">{member.inProgress + member.pending}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-500 block">Blocked</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{member.blocked}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnassigned ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                    }`}
                    style={{ width: `${member.completionPct}%` }}
                  />
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned Deliverables ({member.assignedTasks.length})
                  </h5>
                  {member.assignedTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No active tasks currently assigned.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {member.assignedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                              {task.id}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                task.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : task.status === 'Blocked'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>

                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                            {task.title}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/60">
                            <span>Due: {task.dueDate}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => viewEvidenceFor(task, 'Task')}
                                className="text-purple-600 dark:text-purple-400 hover:underline"
                              >
                                Evidence
                              </button>
                              {isUnassigned && (
                                <button
                                  onClick={() => {
                                    setReassigningTask(task);
                                    setNewOwnerName('Rahul');
                                  }}
                                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                >
                                  Assign Owner →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isUnassigned && member.total > 0 && (
                <div className="mt-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-200 flex items-center justify-between">
                  <span>Critical: Unassigned deliverables risk deadline slippage.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reassign Modal */}
      {reassigningTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Assign Responsible Owner for {reassigningTask.id}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              "{reassigningTask.title}"
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Team Member
                </label>
                <select
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="Rahul">Rahul (Project Manager)</option>
                  <option value="Priya">Priya (UI Designer)</option>
                  <option value="Arjun">Arjun (Frontend Developer)</option>
                  <option value="Sneha">Sneha (Backend Developer)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassigningTask(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
