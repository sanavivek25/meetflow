import React, { useState, useEffect, useRef } from 'react';
import {
  Quote,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  User,
  Clock,
  ShieldCheck,
  Hash,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';
import { ActionItem, Decision, RiskItem } from '../../types';

export const EvidenceExplorerView: React.FC = () => {
  const {
    activeMeeting,
    selectedEvidence,
    viewEvidenceFor,
    clearSelectedEvidence,
    approveTask,
  } = useMeetFlow();

  const [transcriptFilter, setTranscriptFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'TASKS' | 'DECISIONS' | 'RISKS'>('ALL');
  const [focusedSegmentId, setFocusedSegmentId] = useState<string | null>(null);

  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const segments = activeMeeting?.segments || [];
  const tasks = activeMeeting?.actionItems || [];
  const decisions = activeMeeting?.decisions || [];
  const risks = activeMeeting?.risks || [];

  // If selectedEvidence changed via context, set focus and scroll
  useEffect(() => {
    if (selectedEvidence) {
      if (selectedEvidence.segmentId) {
        setFocusedSegmentId(selectedEvidence.segmentId);
        const el = segmentRefs.current[selectedEvidence.segmentId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Find segment containing the quote
        const cleanQuote = selectedEvidence.quote.toLowerCase();
        const found = segments.find((s) => s.text.toLowerCase().includes(cleanQuote) || cleanQuote.includes(s.text.toLowerCase()));
        if (found) {
          setFocusedSegmentId(found.id);
          const el = segmentRefs.current[found.id];
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
  }, [selectedEvidence, segments]);

  const handleSelectSegment = (segId: string) => {
    setFocusedSegmentId(segId);
    const el = segmentRefs.current[segId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Filtered evidence items for the right inspector
  const evidenceItems: {
    type: 'Task' | 'Decision' | 'Risk';
    id: string;
    title: string;
    quote: string;
    speaker?: string;
    timestamp?: string | null;
    segmentId?: string;
    item: ActionItem | Decision | RiskItem;
  }[] = [];

  if (activeCategory === 'ALL' || activeCategory === 'TASKS') {
    tasks.forEach((t) => {
      evidenceItems.push({
        type: 'Task',
        id: t.id,
        title: t.title,
        quote: t.evidence.quote,
        speaker: t.evidence.speaker || t.owner,
        timestamp: t.evidence.timestamp,
        segmentId: t.evidence.segmentId,
        item: t,
      });
    });
  }

  if (activeCategory === 'ALL' || activeCategory === 'DECISIONS') {
    decisions.forEach((d) => {
      evidenceItems.push({
        type: 'Decision',
        id: d.id,
        title: d.decision,
        quote: d.evidence.quote,
        speaker: d.evidence.speaker,
        timestamp: d.evidence.timestamp,
        segmentId: d.evidence.segmentId,
        item: d,
      });
    });
  }

  if (activeCategory === 'ALL' || activeCategory === 'RISKS') {
    risks.forEach((r) => {
      evidenceItems.push({
        type: 'Risk',
        id: r.id,
        title: r.description,
        quote: r.evidence.quote,
        speaker: r.evidence.speaker,
        segmentId: r.evidence.segmentId,
        item: r,
      });
    });
  }

  return (
    <div className="space-y-4">
      {/* Banner explaining grounded provenance */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
            <Quote className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Transcript Provenance & Grounding Explorer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Non-Hallucinated Guarantee
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Click any extracted item to jump to and highlight its verbatim source dialogue in the transcript.
            </p>
          </div>
        </div>

        {selectedEvidence && (
          <button
            onClick={clearSelectedEvidence}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors shrink-0"
          >
            Clear Highlight
          </button>
        )}
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Original Transcript (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[750px]">
          {/* Transcript Header with Search */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-500" />
                Raw Meeting Transcript
              </h4>
              <span className="text-[11px] text-slate-400">
                {segments.length} dialogue segments with line citations
              </span>
            </div>

            <div className="relative w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={transcriptFilter}
                onChange={(e) => setTranscriptFilter(e.target.value)}
                placeholder="Search transcript..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {segments
              .filter(
                (seg) =>
                  !transcriptFilter ||
                  seg.text.toLowerCase().includes(transcriptFilter.toLowerCase()) ||
                  seg.speaker.toLowerCase().includes(transcriptFilter.toLowerCase())
              )
              .map((seg) => {
                const isFocused =
                  focusedSegmentId === seg.id ||
                  (selectedEvidence &&
                    selectedEvidence.quote &&
                    (seg.text.toLowerCase().includes(selectedEvidence.quote.toLowerCase()) ||
                      selectedEvidence.quote.toLowerCase().includes(seg.text.toLowerCase())));

                return (
                  <div
                    key={seg.id}
                    ref={(el) => {
                      segmentRefs.current[seg.id] = el;
                    }}
                    onClick={() => handleSelectSegment(seg.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isFocused
                        ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-500/40 shadow-md pulse-evidence'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">
                          #{seg.lineNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-[9px] font-bold">
                            {seg.speaker.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {seg.speaker}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {seg.timestamp && (
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            <Clock className="w-2.5 h-2.5" />
                            {seg.timestamp}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded font-semibold">
                          {seg.id}
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-xs leading-relaxed ${
                        isFocused
                          ? 'font-medium text-purple-950 dark:text-purple-100 font-sans'
                          : 'text-slate-700 dark:text-slate-300 font-sans'
                      }`}
                    >
                      {seg.text}
                    </p>

                    {isFocused && (
                      <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-[11px] text-purple-700 dark:text-purple-300">
                        <span className="font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          Grounded Source Evidence Segment
                        </span>
                        <span>Verbatim Quotation</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Side: Extracted Item Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[750px]">
          {/* Category tabs */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Extracted Grounded Items
            </h4>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              {(['ALL', 'TASKS', 'DECISIONS', 'RISKS'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-center ${
                    activeCategory === cat
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {cat === 'ALL'
                    ? 'All'
                    : cat === 'TASKS'
                    ? `Tasks (${tasks.length})`
                    : cat === 'DECISIONS'
                    ? `Decisions (${decisions.length})`
                    : `Risks (${risks.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* List of items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {evidenceItems.map((item) => {
              const isSelected =
                selectedEvidence?.sourceId === item.id ||
                (selectedEvidence && selectedEvidence.quote === item.quote);

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    viewEvidenceFor(item.item, item.type);
                    if (item.segmentId) {
                      handleSelectSegment(item.segmentId);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-xs ring-1 ring-indigo-500/40'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          item.type === 'Task'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            : item.type === 'Decision'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      {item.speaker && (
                        <span>By {item.speaker}</span>
                      )}
                    </div>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h5>

                  {/* Supporting quote preview */}
                  <div className="mt-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 italic border-l-2 border-l-purple-500">
                    "{item.quote}"
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Grounded Citation
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                      Highlight in Transcript →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
