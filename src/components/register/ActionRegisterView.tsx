import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit3,
  Quote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';
import { ActionItem, PriorityLevel, TaskStatus, ApprovalStatus } from '../../types';
import { TaskEditModal } from './TaskEditModal';

export const ActionRegisterView: React.FC = () => {
  const {
    activeMeeting,
    updateTask,
    deleteTask,
    createTask,
    approveTask,
    bulkApproveTasks,
    viewEvidenceFor,
    showToast,
  } = useMeetFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwner, setFilterOwner] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterApproval, setFilterApproval] = useState('ALL');
  const [sortField, setSortField] = useState<'dueDate' | 'priority' | 'id'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Selected tasks for bulk operations
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<ActionItem | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const tasks = activeMeeting?.actionItems || [];
  const allTaskIds = tasks.map((t) => t.id);

  // Distinct owners
  const distinctOwners = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.owner)));
  }, [tasks]);

  // Filter & Sort
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.owner.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesOwner = filterOwner === 'ALL' || t.owner === filterOwner;
        const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
        const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
        const matchesApproval = filterApproval === 'ALL' || t.approvalStatus === filterApproval;

        return matchesSearch && matchesOwner && matchesPriority && matchesStatus && matchesApproval;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'dueDate') {
          if (valA === 'Not specified') return 1;
          if (valB === 'Not specified') return -1;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tasks, searchQuery, filterOwner, filterPriority, filterStatus, filterApproval, sortField, sortDirection]);

  // Bulk selection handling
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleToggleSelect = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkApprove = () => {
    bulkApproveTasks(selectedTaskIds);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) {
      selectedTaskIds.forEach((id) => deleteTask(id));
      setSelectedTaskIds([]);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      'Task ID',
      'Title',
      'Description',
      'Owner',
      'Team',
      'Due Date',
      'Priority',
      'Status',
      'Dependencies',
      'Approval Status',
      'Evidence Quote',
    ];
    const rows = filteredTasks.map((t) => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.owner}"`,
      `"${t.team}"`,
      `"${t.dueDate}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.dependencies.join(';')}"`,
      `"${t.approvalStatus}"`,
      `"${t.evidence.quote.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meetflow_action_register_${activeMeeting?.id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Action Register to CSV');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredTasks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `meetflow_action_register_${activeMeeting?.id || 'export'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Action Register to JSON');
  };

  const handleCreateNewTask = () => {
    createTask({
      meetingId: activeMeeting?.id || 'meet-demo-101',
      meetingTitle: activeMeeting?.title,
      title: 'New action item',
      description: 'Manually added follow-up deliverable',
      owner: 'Unassigned',
      team: 'General',
      dueDate: 'Not specified',
      priority: 'Medium',
      status: 'Pending',
      dependencies: [],
      risks: [],
      confidence: 100,
      approvalStatus: 'Pending',
      evidence: {
        quote: 'Manually created by project lead during review',
        speaker: 'Rahul',
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Bar & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by task title, description, or owner..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCreateNewTask}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              title="Export as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              title="Export as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px] uppercase tracking-wider mr-1">
            <Filter className="w-3 h-3 text-indigo-500" />
            Filters:
          </span>

          {/* Owner filter */}
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs"
          >
            <option value="ALL">All Owners</option>
            {distinctOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
          </select>

          {/* Approval filter */}
          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs"
          >
            <option value="ALL">All Approvals</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Sort field */}
          <div className="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
            <span>Sort by:</span>
            <button
              onClick={() => {
                if (sortField === 'dueDate') {
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortField('dueDate');
                  setSortDirection('asc');
                }
              }}
              className={`px-2 py-1 rounded font-semibold ${
                sortField === 'dueDate'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Deadline {sortField === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions banner if selected */}
      {selectedTaskIds.length > 0 && (
        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-semibold text-purple-900 dark:text-purple-200">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{selectedTaskIds.length} tasks selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
            >
              Approve Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-semibold text-xs transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Interactive Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-3.5">Task ID</th>
                <th className="p-3.5 min-w-[220px]">Action Item & Description</th>
                <th className="p-3.5">Owner</th>
                <th className="p-3.5">Team</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Dependencies</th>
                <th className="p-3.5">Evidence</th>
                <th className="p-3.5">Approval</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400">
                    No action items found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(task.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Task ID */}
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {task.id}
                      </td>

                      {/* Action Item Title & Desc */}
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                          {task.title}
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                              task.owner === 'Unassigned'
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                            }`}
                          >
                            {task.owner.slice(0, 2).toUpperCase()}
                          </span>
                          <span
                            className={`font-medium ${
                              task.owner === 'Unassigned'
                                ? 'text-amber-600 dark:text-amber-400 font-bold'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {task.owner}
                          </span>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {task.team}
                      </td>

                      {/* Due Date */}
                      <td className="p-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {task.dueDate}
                      </td>

                      {/* Priority */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            task.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-500/20'
                              : task.priority === 'High'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-500/20'
                              : task.priority === 'Medium'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-500/20'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3.5 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTask({ ...task, status: e.target.value as TaskStatus })
                          }
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      </td>

                      {/* Dependencies */}
                      <td className="p-3.5 whitespace-nowrap">
                        {task.dependencies.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {task.dependencies.map((dep) => (
                              <span
                                key={dep}
                                className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold"
                              >
                                {dep}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>

                      {/* Evidence Link */}
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => viewEvidenceFor(task, 'Task')}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition-colors"
                          title={`Quote: "${task.evidence.quote}"`}
                        >
                          <Quote className="w-3 h-3" />
                          Evidence
                        </button>
                      </td>

                      {/* Approval Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                            task.approvalStatus === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : task.approvalStatus === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {task.approvalStatus === 'Approved' && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                          {task.approvalStatus === 'Pending' && (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          {task.approvalStatus === 'Rejected' && (
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {task.approvalStatus}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {task.approvalStatus === 'Pending' && (
                            <button
                              onClick={() => approveTask(task.id)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                              title="Approve task"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit task parameters"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete task ${task.id}?`)) {
                                deleteTask(task.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>
            Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks in active meeting
          </span>
          <span className="text-[11px] text-slate-400">
            Click 'Evidence' to view verbatim transcript source
          </span>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={updateTask}
        allTaskIds={allTaskIds}
      />
    </div>
  );
};
