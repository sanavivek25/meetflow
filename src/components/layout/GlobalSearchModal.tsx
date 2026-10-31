import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Quote,
  AlertTriangle,
  Calendar,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    meetings,
    activeMeeting,
    setCurrentTab,
    viewEvidenceFor,
  } = useMeetFlow();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  useEffect(() => {
    if (globalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [globalSearchOpen]);

  if (!globalSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search across tasks
  const matchedTasks = meetings
    .flatMap((m) => m.actionItems.map((t) => ({ ...t, meetingTitle: m.title })))
    .filter(
      (t) =>
        t.title.toLowerCase().includes(trimmed) ||
        t.owner.toLowerCase().includes(trimmed) ||
        t.team.toLowerCase().includes(trimmed) ||
        t.description.toLowerCase().includes(trimmed)
    )
    .slice(0, 5);

  // Search across decisions
  const matchedDecisions = meetings
    .flatMap((m) => m.decisions.map((d) => ({ ...d, meetingTitle: m.title })))
    .filter((d) => d.decision.toLowerCase().includes(trimmed))
    .slice(0, 4);

  // Search across risks
  const matchedRisks = meetings
    .flatMap((m) => m.risks.map((r) => ({ ...r, meetingTitle: m.title })))
    .filter(
      (r) =>
        r.description.toLowerCase().includes(trimmed) ||
        r.category.toLowerCase().includes(trimmed) ||
        r.recommendedMitigation.toLowerCase().includes(trimmed)
    )
    .slice(0, 4);

  // Search across transcript quotes
  const matchedQuotes = meetings
    .flatMap((m) =>
      m.segments.map((s) => ({
        ...s,
        meetingId: m.id,
        meetingTitle: m.title,
      }))
    )
    .filter(
      (s) =>
        s.text.toLowerCase().includes(trimmed) ||
        s.speaker.toLowerCase().includes(trimmed)
    )
    .slice(0, 5);

  const totalResults =
    trimmed === ''
      ? 0
      : matchedTasks.length +
        matchedDecisions.length +
        matchedRisks.length +
        matchedQuotes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, decisions, transcript quotes, or owners..."
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {trimmed === '' ? (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
              <p className="text-xs font-medium">Type keywords to search across meeting data</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Try "Arjun"
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Try "API"
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Try "Testing"
                </span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No results found matching "{query}"
            </div>
          ) : (
            <>
              {/* Tasks */}
              {matchedTasks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                    Action Items ({matchedTasks.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setCurrentTab('action-register');
                        }}
                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded">
                              {task.id}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {task.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Owner: <span className="text-slate-600 dark:text-slate-300 font-medium">{task.owner}</span> • Due: {task.dueDate} • Meeting: {task.meetingTitle}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decisions */}
              {matchedDecisions.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-purple-500" />
                    Decisions ({matchedDecisions.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedDecisions.map((dec) => (
                      <div
                        key={dec.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          viewEvidenceFor(dec, 'Decision');
                        }}
                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {dec.decision}
                          </p>
                          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5 italic">
                            Evidence: "{dec.evidence.quote}"
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks */}
              {matchedRisks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Risks & Blockers ({matchedRisks.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedRisks.map((risk) => (
                      <div
                        key={risk.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setCurrentTab('risk-center');
                        }}
                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            {risk.category}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                            {risk.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcript Quotes */}
              {matchedQuotes.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-emerald-500" />
                    Transcript Lines ({matchedQuotes.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedQuotes.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          viewEvidenceFor(
                            {
                              id: q.id,
                              title: `Transcript: ${q.speaker}`,
                              evidence: {
                                quote: q.text,
                                speaker: q.speaker,
                                segmentId: q.id,
                                timestamp: q.timestamp,
                              },
                            },
                            'Task'
                          );
                        }}
                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {q.speaker}:
                          </span>
                          {q.timestamp && (
                            <span className="text-[10px] font-mono text-slate-400">
                              [{q.timestamp}]
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                          "{q.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal footer shortcut guide */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Search spans tasks, quotes, decisions, and risks</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
