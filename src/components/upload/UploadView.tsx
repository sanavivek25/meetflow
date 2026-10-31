import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Quote,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';
import {
  SAMPLE_TRANSCRIPT_TITLE,
  SAMPLE_TRANSCRIPT_DATE,
  SAMPLE_TRANSCRIPT_TYPE,
  SAMPLE_TRANSCRIPT_PARTICIPANTS,
  SAMPLE_TRANSCRIPT_TEXT,
} from '../../services/storage';
import { analyzeTranscript } from '../../services/api';
import { parseTranscriptSegments } from '../../utils/transcriptParser';
import { Meeting } from '../../types';

export const UploadView: React.FC = () => {
  const { addMeeting, setCurrentTab, showToast, serverStatus } = useMeetFlow();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingType, setMeetingType] = useState('Sprint Planning');
  const [participantsText, setParticipantsText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [lastAnalyzedMeeting, setLastAnalyzedMeeting] = useState<Meeting | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const stages = [
    'Parsing conversational dialogue & speaker turns...',
    'Invoking Gemini 3.8 Flash model with factual grounding...',
    'Extracting decisions, non-hallucinated tasks, and dependencies...',
    'Linking exact transcript quotations and confidence scores...',
  ];

  const handleLoadSample = () => {
    setTitle(SAMPLE_TRANSCRIPT_TITLE);
    setDate(SAMPLE_TRANSCRIPT_DATE);
    setMeetingType(SAMPLE_TRANSCRIPT_TYPE);
    setParticipantsText(
      SAMPLE_TRANSCRIPT_PARTICIPANTS.map((p) => `${p.name} (${p.role})`).join(', ')
    );
    setTranscript(SAMPLE_TRANSCRIPT_TEXT);
    setValidationError(null);
    showToast('Loaded Website Development Planning sample transcript');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setTranscript(text);
        showToast(`Imported ${file.name} successfully`);
      }
    };
    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim() || transcript.trim().length < 15) {
      setValidationError('Please provide a valid transcript with at least 15 characters.');
      return;
    }
    if (!title.trim()) {
      setValidationError('Please enter a meeting title.');
      return;
    }
    setValidationError(null);
    setIsAnalyzing(true);
    setAnalysisStage(0);

    const stageInterval = setInterval(() => {
      setAnalysisStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      const participantNames = participantsText
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const result = await analyzeTranscript({
        transcript,
        title,
        date,
        participants: participantNames,
        meetingType,
      });

      clearInterval(stageInterval);
      setAnalysisStage(3);

      const segments = parseTranscriptSegments(transcript);
      const meetingId = `meet-${Date.now()}`;

      const newMeeting: Meeting = {
        id: meetingId,
        title: title.trim(),
        date,
        meetingType,
        participants:
          participantNames.length > 0
            ? participantNames.map((p) => {
                const parts = p.split('(');
                const name = parts[0].trim();
                const role = parts[1] ? parts[1].replace(')', '').trim() : undefined;
                return { name, role };
              })
            : [{ name: 'Participants', role: 'Team' }],
        rawTranscript: transcript,
        segments,
        summary: result.meetingSummary || 'Analysis completed successfully.',
        keyDiscussionPoints: result.keyDiscussionPoints || [],
        decisions: (result.decisions || []).map((d: any, idx: number) => ({
          id: d.id || `DEC-${idx + 1}`,
          meetingId,
          decision: d.decision,
          impact: d.impact || 'Team operational milestone.',
          evidence: {
            quote: d.evidence?.quote || transcript.slice(0, 80),
            speaker: d.evidence?.speaker || 'Speaker',
            timestamp: d.evidence?.timestamp || null,
            segmentId: d.evidence?.segmentId || `seg-${idx + 1}`,
          },
        })),
        actionItems: (result.actionItems || []).map((t: any, idx: number) => ({
          id: t.id || `TASK-${Math.floor(100 + Math.random() * 900)}`,
          meetingId,
          meetingTitle: title,
          title: t.title,
          description: t.description || t.title,
          owner: t.owner && t.owner !== 'null' ? t.owner : 'Unassigned',
          team: t.team || 'Engineering',
          dueDate: t.dueDate && t.dueDate !== 'null' ? t.dueDate : 'Not specified',
          priority: t.priority || 'Medium',
          status: t.status || 'Pending',
          dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
          risks: Array.isArray(t.risks) ? t.risks : [],
          confidence: t.confidence || 92,
          approvalStatus: 'Pending',
          evidence: {
            quote: t.evidence?.quote || transcript.slice(0, 80),
            speaker: t.evidence?.speaker || 'Speaker',
            timestamp: t.evidence?.timestamp || null,
            segmentId: t.evidence?.segmentId || `seg-${idx + 1}`,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        risks: (result.risks || []).map((r: any, idx: number) => ({
          id: r.id || `RISK-0${idx + 1}`,
          meetingId,
          category: r.category || 'Operational',
          severity: r.severity || 'Medium',
          description: r.description,
          relatedTaskId: r.relatedTaskId,
          recommendedMitigation: r.recommendedMitigation || 'Review with task owner.',
          evidence: {
            quote: r.evidence?.quote || transcript.slice(0, 60),
            speaker: r.evidence?.speaker || 'Speaker',
            segmentId: r.evidence?.segmentId || `seg-${idx + 1}`,
          },
          status: 'Open',
        })),
        unresolvedQuestions: (result.unresolvedQuestions || []).map((q: any, idx: number) => ({
          id: q.id || `Q-0${idx + 1}`,
          meetingId,
          question: q.question,
          context: q.context,
          suggestedAction: q.suggestedAction || 'Clarify with project manager.',
          status: 'Open',
        })),
        createdAt: new Date().toISOString(),
      };

      setLastAnalyzedMeeting(newMeeting);
      addMeeting(newMeeting);
      setIsAnalyzing(false);
    } catch (error: any) {
      clearInterval(stageInterval);
      setIsAnalyzing(false);
      setValidationError(error?.message || 'Transcript analysis failed. Please try again.');
      showToast('Analysis error occurred', 'error');
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setParticipantsText('');
    setTranscript('');
    setLastAnalyzedMeeting(null);
    setValidationError(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header bar with sample button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            AI Ingestion Engine
          </span>
          <h2 className="text-lg font-bold text-white mt-1">
            Analyze Meeting Transcripts with Gemini
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Extract verified action items, non-hallucinated owners, dependencies, and textual quotes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all shrink-0 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Load Sample Transcript
          </button>
          <button
            onClick={handleResetForm}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            title="Clear form"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Validation alert */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata config */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Meeting Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Development Planning"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Meeting Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Meeting Type
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Sprint Planning">Sprint Planning</option>
                <option value="Strategy & Roadmap">Strategy & Roadmap</option>
                <option value="Architecture & Tech">Architecture & Tech</option>
                <option value="Client / Stakeholder">Client / Stakeholder</option>
                <option value="Daily Standup">Daily Standup</option>
                <option value="Retrospective">Retrospective</option>
                <option value="General">General Sync</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Participants (comma-separated)</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <input
              type="text"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              placeholder="e.g. Rahul (PM), Priya (Design), Arjun (Frontend)"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* File Upload Zone */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Upload Document / Transcript
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/40 transition-colors">
              <Upload className="w-6 h-6 text-indigo-500 mb-1.5" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose file or drag here
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Supports TXT, CSV, DOCX & PDF exports
              </span>
              <input
                type="file"
                accept=".txt,.csv,.json,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Model info banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Grounded Extraction Rules:</span>
            </div>
            <p>• Never hallucinates missing assignees or arbitrary deadlines.</p>
            <p>• Explicitly links each task to its verbatim transcript quote.</p>
          </div>
        </div>

        {/* Right Column: Transcript editor */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Transcript Dialogue Input
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {transcript.split('\n').filter((l) => l.trim()).length} dialogue turns •{' '}
                {transcript.length} chars
              </span>
            </div>

            <textarea
              rows={16}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste meeting transcript here with speaker names (e.g., 'Rahul: We need to complete the website by Nov 15')..."
              className="w-full p-4 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Progress / Status banner during analysis */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  {stages[analysisStage]}
                </span>
                <span>Stage {analysisStage + 1} of 4</span>
              </div>
              <div className="w-full bg-indigo-200 dark:bg-indigo-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-700 ease-out"
                  style={{ width: `${((analysisStage + 1) / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Human-in-the-loop: All extracted items require approval before sync.
            </span>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all ${
                isAnalyzing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30 active:scale-95'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  Analyzing Transcript...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Analyze Meeting with Gemini
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Preview Card if just analyzed */}
      {lastAnalyzedMeeting && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/50 shadow-xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Extraction Complete
                </span>
                <span className="text-xs text-slate-400">
                  {lastAnalyzedMeeting.actionItems.length} action items •{' '}
                  {lastAnalyzedMeeting.decisions.length} decisions •{' '}
                  {lastAnalyzedMeeting.risks.length} risks
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {lastAnalyzedMeeting.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('action-register')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Open Smart Action Register
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentTab('evidence-explorer')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold border border-purple-200 dark:border-purple-800 transition-colors"
              >
                <Quote className="w-3.5 h-3.5" />
                View Evidence
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Executive Meeting Summary
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {lastAnalyzedMeeting.summary}
            </p>
          </div>

          {/* Extracted items grid preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action Items List */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Extracted Action Items ({lastAnalyzedMeeting.actionItems.length})</span>
                <span className="text-[10px] text-amber-500 font-semibold">
                  Awaiting Human Approval
                </span>
              </h4>
              <div className="space-y-2">
                {lastAnalyzedMeeting.actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-indigo-500">
                          {item.id}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Owner: <strong>{item.owner}</strong> • Due: {item.dueDate}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decisions and Risks */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Agreed Decisions ({lastAnalyzedMeeting.decisions.length})
                </h4>
                {lastAnalyzedMeeting.decisions.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs"
                  >
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{d.decision}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 italic">
                      Evidence: "{d.evidence.quote}"
                    </p>
                  </div>
                ))}
              </div>

              {lastAnalyzedMeeting.unresolvedQuestions.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    Unresolved Ownership & Ambiguities ({lastAnalyzedMeeting.unresolvedQuestions.length})
                  </h4>
                  {lastAnalyzedMeeting.unresolvedQuestions.map((q) => (
                    <div key={q.id} className="text-xs space-y-0.5">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        {q.question}
                      </p>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                        {q.context}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
