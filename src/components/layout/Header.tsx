import React from 'react';
import {
  Menu,
  Search,
  Moon,
  Sun,
  FilePlus,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';
import { NavigationTab } from '../../types';

interface HeaderProps {
  onOpenMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const {
    currentTab,
    setCurrentTab,
    activeMeeting,
    darkMode,
    toggleDarkMode,
    setGlobalSearchOpen,
  } = useMeetFlow();

  const tabTitles: Record<NavigationTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Executive Dashboard',
      subtitle: 'Real-time project accountability, velocity, and risk posture',
    },
    upload: {
      title: 'Meeting Transcript Ingestion',
      subtitle: 'Upload files or paste transcripts for Gemini-powered extraction',
    },
    'action-register': {
      title: 'Smart Action Register',
      subtitle: 'Central editable task register with ownership and evidence links',
    },
    'evidence-explorer': {
      title: 'Transcript Evidence Explorer',
      subtitle: 'Direct textual provenance and speaker citations for every extraction',
    },
    'dependency-map': {
      title: 'Dependency Mapping & Graph',
      subtitle: 'Interactive task dependencies, blockers, and critical delivery paths',
    },
    'risk-center': {
      title: 'Risk Detection Center',
      subtitle: 'AI-identified schedule bottlenecks, ownership gaps, and mitigation paths',
    },
    'approval-hub': {
      title: 'Human-in-the-Loop Approval Hub',
      subtitle: 'Explicit human verification before dispatching to external integrations',
    },
    'team-accountability': {
      title: 'Team Accountability Matrix',
      subtitle: 'Individual ownership metrics, completion ratios, and overdue task tracking',
    },
    'meeting-history': {
      title: 'Meeting Archive & Audit Log',
      subtitle: 'Historical transcripts, decisions, and system verification logs',
    },
  };

  const currentInfo = tabTitles[currentTab] || {
    title: 'MeetFlow AI',
    subtitle: 'Meeting-to-Action Tracker',
  };

  const pendingApprovals =
    activeMeeting?.actionItems.filter((t) => t.approvalStatus === 'Pending').length || 0;

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5">
        {/* Left: Mobile hamburger & Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {currentInfo.title}
              </h1>
              {activeMeeting && (
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Calendar className="w-3 h-3 text-indigo-500" />
                  {activeMeeting.title}
                </span>
              )}
            </div>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global search button */}
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60 transition-all shadow-xs"
            title="Search transcripts, tasks, decisions (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Quick search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Pending Approvals quick badge */}
          {pendingApprovals > 0 && (
            <button
              onClick={() => setCurrentTab('approval-hub')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              title={`${pendingApprovals} unapproved tasks awaiting human review`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Pending Review:</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[11px] font-bold">
                {pendingApprovals}
              </span>
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* New Transcript / Upload CTA */}
          <button
            onClick={() => setCurrentTab('upload')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Analysis</span>
            <FilePlus className="w-3.5 h-3.5 sm:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
};
