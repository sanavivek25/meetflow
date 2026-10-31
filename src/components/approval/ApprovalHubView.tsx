import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  Quote,
  Clock,
  Send,
  AlertTriangle,
  History,
  CheckSquare,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';
import { ActionItem, IntegrationPlatform } from '../../types';
import { IntegrationSimulatorModal } from './IntegrationSimulatorModal';
import { TaskEditModal } from '../register/TaskEditModal';

export const ApprovalHubView: React.FC = () => {
  const {
    activeMeeting,
    approveTask,
    rejectTask,
    bulkApproveTasks,
    simulateIntegrationSync,
    updateTask,
    viewEvidenceFor,
    auditLogs,
    showToast,
  } = useMeetFlow();

  const [activeQueueTab, setActiveQueueTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedTaskForSync, setSelectedTaskForSync] = useState<ActionItem | null>(null);
  const [editingTask, setEditingTask] = useState<ActionItem | null>(null);
  const [rejectReasonPromptId, setRejectReasonPromptId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const tasks = activeMeeting?.actionItems || [];
  const allTaskIds = tasks.map((t) => t.id);

  const pendingTasks = tasks.filter((t) => t.approvalStatus === 'Pending');
  const approvedTasks = tasks.filter((t) => t.approvalStatus === 'Approved');
  const rejectedTasks = tasks.filter((t) => t.approvalStatus === 'Rejected');

  // Filter approval/rejection audit logs
  const approvalLogs = auditLogs.filter(
    (log) =>
      log.action === 'APPROVED' ||
      log.action === 'REJECTED' ||
      log.action === 'SIMULATED_SYNC'
  );

  const handleConfirmReject = (taskId: string) => {
    rejectTask(taskId, rejectReason.trim() || 'Task owner or deadline contradicts meeting context');
    setRejectReasonPromptId(null);
    setRejectReason('');
  };

  const handleBulkApproveAllPending = () => {
    if (pendingTasks.length === 0) return;
    bulkApproveTasks(pendingTasks.map((t) => t.id));
    showToast(`Bulk approved ${pendingTasks.length} pending tasks`);
  };

  return (
    <div className="space-y-6">
      {/* Top Protocol Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-purple-500/20 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
              Mandatory Human-in-the-Loop Protocol
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Task Verification & External Integration Gateway
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            No meeting item can be dispatched to Google Tasks, Calendar, Trello, or Slack without explicit human approval.
          </p>
        </div>

        {pendingTasks.length > 0 && (
          <button
            onClick={handleBulkApproveAllPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 active:scale-95 transition-all shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            Bulk Approve All ({pendingTasks.length})
          </button>
        )}
      </div>

      {/* 6-Step Verification Checklist Visual Guide */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
          Mandatory 6-Step Human Verification Flow
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {[
            { step: '1', label: 'Review Extracted Task', desc: 'Confirm wording reflects true agreement' },
            { step: '2', label: 'Verify Assigned Owner', desc: 'Ensure name is agreed, not guessed' },
            { step: '3', label: 'Confirm Due Date', desc: 'Validate realistic schedule deadline' },
            { step: '4', label: 'Check Evidence Quote', desc: 'Inspect verbatim speaker citation' },
            { step: '5', label: 'Edit If Inaccurate', desc: 'Adjust parameters prior to sign-off' },
            { step: '6', label: 'Approve & Sync', desc: 'Authorize simulated external dispatch' },
          ].map((item) => (
            <div
              key={item.step}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center mb-1.5">
                  {item.step}
                </span>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {item.label}
                </h5>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveQueueTab('PENDING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeQueueTab === 'PENDING'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Human Verification Queue ({pendingTasks.length})
        </button>

        <button
          onClick={() => setActiveQueueTab('APPROVED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeQueueTab === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved & Ready for Sync ({approvedTasks.length})
        </button>

        <button
          onClick={() => setActiveQueueTab('REJECTED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeQueueTab === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Rejected Items ({rejectedTasks.length})
        </button>
      </div>

      {/* Queue Content */}
      {activeQueueTab === 'PENDING' && (
        <div className="space-y-4">
          {pendingTasks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                All Extracted Tasks Have Been Verified!
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                No items are currently stalled in the pending verification queue. Switch to "Approved & Ready for Sync" to dispatch.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {task.id}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {task.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            task.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {task.description}
                      </p>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Assigned Owner
                        </span>
                        <span
                          className={`font-bold ${
                            task.owner === 'Unassigned'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {task.owner}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Deadline
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Supporting Transcript Evidence Callout */}
                  <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Quote className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-0.5">
                          Supporting Transcript Quote ({task.evidence.speaker || 'Speaker'}):
                        </span>
                        <p className="italic text-purple-950 dark:text-purple-100">
                          "{task.evidence.quote}"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => viewEvidenceFor(task, 'Task')}
                      className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline shrink-0 flex items-center gap-1"
                    >
                      View in Transcript <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Rejection Prompt if open */}
                  {rejectReasonPromptId === task.id && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2 animate-in fade-in">
                      <label className="block text-xs font-semibold text-rose-800 dark:text-rose-200">
                        Reason for Rejection:
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Disagreed in chat; owner is incorrect; deferred to next quarter"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRejectReasonPromptId(null)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmReject(task.id)}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[11px] text-slate-400">
                      Confidence Score: <strong className="text-slate-700 dark:text-slate-200">{task.confidence}%</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Details
                      </button>

                      <button
                        onClick={() => setRejectReasonPromptId(task.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        onClick={() => approveTask(task.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Task
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approved Queue */}
      {activeQueueTab === 'APPROVED' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200">
            These tasks have undergone explicit human verification. You can now simulate dispatching them to external productivity integrations.
          </div>

          <div className="space-y-3">
            {approvedTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {task.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {task.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Owner: <strong>{task.owner}</strong> • Due: {task.dueDate} • Team: {task.team}
                  </p>

                  {/* Sync history tags */}
                  {task.externalSync && task.externalSync.syncedTo && task.externalSync.syncedTo.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-slate-400">Synced to:</span>
                      {task.externalSync.syncedTo.map((plat) => (
                        <span
                          key={plat}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {plat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => viewEvidenceFor(task, 'Task')}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="View transcript evidence"
                  >
                    <Quote className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedTaskForSync(task)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simulate Integration Sync
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Queue */}
      {activeQueueTab === 'REJECTED' && (
        <div className="space-y-4">
          {rejectedTasks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
              No rejected tasks.
            </div>
          ) : (
            <div className="space-y-3">
              {rejectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                        {task.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-through opacity-75">
                        {task.title}
                      </h4>
                    </div>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                      Rejection Reason: {task.rejectionReason || 'Item does not match agreement.'}
                    </p>
                  </div>

                  <button
                    onClick={() => approveTask(task.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Restore to Approved
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval & Integration History Log */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <History className="w-4 h-4 text-indigo-500" />
          Approval & Simulated Integration Audit Trail
        </h4>

        <div className="space-y-2">
          {approvalLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      log.action === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : log.action === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    by {log.user}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Simulator Modal */}
      <IntegrationSimulatorModal
        task={selectedTaskForSync}
        isOpen={Boolean(selectedTaskForSync)}
        onClose={() => setSelectedTaskForSync(null)}
        onConfirmSync={simulateIntegrationSync}
      />

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
