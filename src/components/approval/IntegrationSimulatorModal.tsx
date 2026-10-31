import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Lock,
  Code,
  Calendar,
  CheckSquare,
  Trello,
  MessageSquare,
  Mail,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { ActionItem, IntegrationPlatform } from '../../types';

interface IntegrationSimulatorModalProps {
  task: ActionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSync: (taskId: string, platform: IntegrationPlatform) => void;
}

export const IntegrationSimulatorModal: React.FC<IntegrationSimulatorModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirmSync,
}) => {
  if (!isOpen || !task) return null;

  const [selectedPlatform, setSelectedPlatform] = useState<IntegrationPlatform>('Google Tasks');
  const [confirmedSecurity, setConfirmedSecurity] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  const platforms: {
    id: IntegrationPlatform;
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
  }[] = [
    {
      id: 'Google Tasks',
      name: 'Google Tasks',
      icon: <CheckSquare className="w-4 h-4 text-blue-500" />,
      color: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/30',
      description: 'Creates task under "Project Sprint Deliverables" list with due date and owner tag.',
    },
    {
      id: 'Google Calendar',
      name: 'Google Calendar',
      icon: <Calendar className="w-4 h-4 text-emerald-500" />,
      color: 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30',
      description: 'Schedules all-day milestone reminder with transcript evidence in event description.',
    },
    {
      id: 'Trello',
      name: 'Trello',
      icon: <Trello className="w-4 h-4 text-sky-500" />,
      color: 'border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/30',
      description: 'Adds task card to "Sprint Backlog" with team labels and assigned member.',
    },
    {
      id: 'Slack',
      name: 'Slack',
      icon: <MessageSquare className="w-4 h-4 text-purple-500" />,
      color: 'border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/30',
      description: 'Dispatches notification card to #project-delivery channel tagging owner.',
    },
    {
      id: 'Email',
      name: 'Email Dispatch',
      icon: <Mail className="w-4 h-4 text-amber-500" />,
      color: 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/30',
      description: 'Prepares email notification to assignee with action description and citations.',
    },
  ];

  // Build realistic mock payloads
  const getPayload = () => {
    switch (selectedPlatform) {
      case 'Google Tasks':
        return {
          service: 'Google Tasks API v1',
          tasklist: 'meetflow_sprint_tasks',
          payload: {
            title: `[${task.id}] ${task.title}`,
            notes: `Assigned: ${task.owner} (${task.team})\nMeeting: ${task.meetingTitle || 'Planning'}\nEvidence: "${task.evidence.quote}"`,
            due: task.dueDate !== 'Not specified' ? `${task.dueDate}T18:00:00.000Z` : null,
            status: 'needsAction',
          },
        };
      case 'Google Calendar':
        return {
          service: 'Google Calendar API v3',
          calendarId: 'primary',
          payload: {
            summary: `Milestone: ${task.title}`,
            description: `Deliverable: ${task.description}\nOwner: ${task.owner}\nEvidence Quote: "${task.evidence.quote}"`,
            start: { date: task.dueDate !== 'Not specified' ? task.dueDate : '2026-11-05' },
            end: { date: task.dueDate !== 'Not specified' ? task.dueDate : '2026-11-05' },
            attendees: [{ email: `${task.owner.toLowerCase()}@meetflow.internal` }],
          },
        };
      case 'Trello':
        return {
          service: 'Trello REST API v1',
          board: 'Sprint 44 - Website Launch',
          list: 'To Do',
          payload: {
            name: `${task.id}: ${task.title}`,
            desc: `${task.description}\n\n**Provenance:**\n> "${task.evidence.quote}" (${task.evidence.speaker})`,
            due: task.dueDate,
            labels: [task.priority, task.team],
            idMembers: [task.owner],
          },
        };
      case 'Slack':
        return {
          service: 'Slack Incoming Webhook API',
          channel: '#engineering-action-items',
          payload: {
            text: `🎯 *New Approved Action Item:* ${task.title}`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Task:* ${task.title}\n*Assignee:* @${task.owner}\n*Due Date:* ${task.dueDate}\n*Priority:* ${task.priority}`,
                },
              },
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: `_Transcript citation:_ "${task.evidence.quote}"`,
                  },
                ],
              },
            ],
          },
        };
      case 'Email':
        return {
          service: 'SMTP Dispatcher',
          payload: {
            to: `${task.owner.toLowerCase()}@meetflow.internal`,
            subject: `Action Assigned: ${task.title} (Due ${task.dueDate})`,
            htmlBody: `<p>Hello ${task.owner},</p><p>You were assigned the following task in <b>${task.meetingTitle}</b>:</p><blockquote>${task.description}</blockquote><p><b>Evidence:</b> <i>"${task.evidence.quote}"</i></p>`,
          },
        };
    }
  };

  const payload = getPayload();

  const handleSimulateDispatch = () => {
    onConfirmSync(task.id, selectedPlatform);
    setDispatchedSuccess(true);
    setTimeout(() => {
      setDispatchedSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Simulated External Integration Dispatcher
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict Security Sandbox: Inspect payload before simulated external synchronization
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Zero-Unauthorized-Send Protocol:</span> No live external API tokens or outbound network calls are made without explicit user approval. This sandbox validates the payload schema for external services.
            </div>
          </div>

          {/* Select Platform */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select External Target Platform
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {platforms.map((p) => {
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(p.id);
                      setDispatchedSuccess(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/40 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {p.icon}
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-2">
                      {p.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payload Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Outgoing {selectedPlatform} Payload
              </label>
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
              >
                <Code className="w-3.5 h-3.5" />
                {showRawJson ? 'Formatted View' : 'Raw JSON'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 overflow-x-auto max-h-48">
              {showRawJson ? (
                <pre className="text-[11px] leading-relaxed">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              ) : (
                <div className="space-y-1.5 text-[11px] font-sans">
                  <div>
                    <span className="text-slate-400 font-mono">Service: </span>
                    <span className="font-semibold text-indigo-400">{payload.service}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono">Title / Summary: </span>
                    <span className="text-white font-semibold">{(payload.payload as any).title || (payload.payload as any).summary || (payload.payload as any).name || (payload.payload as any).subject}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono">Assignee: </span>
                    <span className="text-emerald-400 font-medium">{task.owner}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono">Due Date: </span>
                    <span className="text-amber-400 font-medium">{task.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono">Grounded Evidence: </span>
                    <span className="text-slate-300 italic font-mono text-[10px]">"{task.evidence.quote}"</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security confirmation */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedSecurity}
              onChange={(e) => setConfirmedSecurity(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              I have reviewed the task owner, deadline, and supporting evidence quotation, and explicitly authorize dispatching this action item to {selectedPlatform}.
            </span>
          </label>

          {/* Dispatch success feedback */}
          {dispatchedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold">Simulated Sync Dispatched (HTTP 200 OK):</span> Task record synchronized with external integration sandbox. Audit log updated.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <span className="text-[11px] text-slate-400">
            Target Status: <strong>{task.status}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!confirmedSecurity || dispatchedSuccess}
              onClick={handleSimulateDispatch}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl text-white shadow-md transition-all ${
                !confirmedSecurity || dispatchedSuccess
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/25 active:scale-95'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch to {selectedPlatform}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
