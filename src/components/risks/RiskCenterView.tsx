import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Quote,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Plus,
  HelpCircle,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';
import { RiskItem, RiskSeverity, RiskCategory } from '../../types';

export const RiskCenterView: React.FC = () => {
  const {
    activeMeeting,
    updateRisk,
    createTask,
    viewEvidenceFor,
    resolveClarification,
    showToast,
  } = useMeetFlow();

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const risks: RiskItem[] = activeMeeting?.risks || [];
  const clarifications = activeMeeting?.unresolvedQuestions || [];

  const filteredRisks = risks.filter((r) => {
    const matchSev = filterSeverity === 'ALL' || r.severity === filterSeverity;
    const matchCat = filterCategory === 'ALL' || r.category === filterCategory;
    return matchSev && matchCat;
  });

  const handleStatusChange = (risk: RiskItem, newStatus: 'Open' | 'Mitigated' | 'Accepted') => {
    updateRisk({ ...risk, status: newStatus });
  };

  const handleCreateMitigationTask = (risk: RiskItem) => {
    createTask({
      meetingId: risk.meetingId,
      meetingTitle: activeMeeting?.title,
      title: `Mitigate ${risk.category} Risk: ${risk.description.slice(0, 45)}...`,
      description: `Recommended Mitigation: ${risk.recommendedMitigation}`,
      owner: 'Unassigned',
      team: 'Risk Mitigation',
      dueDate: 'Not specified',
      priority: risk.severity === 'Critical' ? 'Critical' : 'High',
      status: 'Pending',
      dependencies: risk.relatedTaskId ? [risk.relatedTaskId] : [],
      risks: [risk.description],
      confidence: 95,
      approvalStatus: 'Pending',
      evidence: {
        quote: risk.evidence.quote,
        speaker: risk.evidence.speaker,
      },
    });
    handleStatusChange(risk, 'Mitigated');
    showToast(`Created mitigation task for ${risk.id}`);
  };

  return (
    <div className="space-y-6">
      {/* AI Prediction Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                AI Risk Detection Engine
              </h3>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                Decision Support Suggestion Only
              </span>
            </div>
            <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5">
              NOTICE: AI predictions and risk scores are automated decision-support suggestions grounded in conversational statements, not certified guarantees. Human review required.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            Filter By:
          </span>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Categories</option>
            <option value="Deadline">Deadline</option>
            <option value="Dependency">Dependency</option>
            <option value="Unassigned Ownership">Unassigned Ownership</option>
            <option value="Resource">Resource</option>
            <option value="Communication">Communication</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            Open Risks: <strong className="text-rose-600 dark:text-rose-400 font-bold">{risks.filter((r) => r.status === 'Open').length}</strong>
          </span>
          <span>•</span>
          <span>
            Mitigated: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{risks.filter((r) => r.status === 'Mitigated').length}</strong>
          </span>
        </div>
      </div>

      {/* Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRisks.map((risk) => (
          <div
            key={risk.id}
            className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all bg-white dark:bg-slate-900 ${
              risk.severity === 'Critical'
                ? 'border-rose-400/80 dark:border-rose-900/80'
                : risk.severity === 'High'
                ? 'border-amber-400/80 dark:border-amber-900/80'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    risk.severity === 'Critical'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : risk.severity === 'High'
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  {risk.severity} Severity
                </span>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {risk.category}
                </span>
              </div>

              {/* Description */}
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {risk.description}
              </h4>

              {risk.relatedTaskId && (
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Related Task: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{risk.relatedTaskId}</span>
                </div>
              )}

              {/* Mitigation recommendation */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  AI Recommended Mitigation:
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  {risk.recommendedMitigation}
                </p>
              </div>

              {/* Evidence Quote */}
              <div className="mt-3 p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/60 text-[11px] text-purple-900 dark:text-purple-300 italic flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 shrink-0 text-purple-500 mt-0.5" />
                <span>"{risk.evidence.quote}" {risk.evidence.speaker && `— ${risk.evidence.speaker}`}</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <select
                value={risk.status}
                onChange={(e) => handleStatusChange(risk, e.target.value as any)}
                className="px-2 py-1 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="Open">Open</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Accepted">Risk Accepted</option>
              </select>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => viewEvidenceFor(risk, 'Risk')}
                  className="p-1.5 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-lg transition-colors"
                  title="View transcript evidence"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                {risk.status !== 'Mitigated' && (
                  <button
                    onClick={() => handleCreateMitigationTask(risk)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    title="Automatically create a mitigation task in Action Register"
                  >
                    <Plus className="w-3 h-3" />
                    Mitigate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unresolved Questions & Clarifications Section */}
      {clarifications.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                Unresolved Questions & Ownership Gaps
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Ambiguous statements or unassigned responsibilities detected by Gemini requiring project lead sign-off.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {clarifications.filter((q) => q.status === 'Open').length} pending clarification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clarifications.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {item.id}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {item.question}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Context: {item.context}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                    Suggested Action: {item.suggestedAction}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.status === 'Open' && (
                    <button
                      onClick={() => resolveClarification(item.id)}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Mark Resolved ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
