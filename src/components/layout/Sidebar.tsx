import React from 'react';
import {
  LayoutDashboard,
  FileUp,
  CheckSquare,
  Quote,
  Network,
  AlertTriangle,
  ShieldCheck,
  Users,
  History,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useMeetFlow } from '../../context/MeetFlowContext';
import { NavigationTab } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    currentTab,
    setCurrentTab,
    meetings,
    activeMeetingId,
    setActiveMeetingId,
    activeMeeting,
    serverStatus,
    resetToDemo,
  } = useMeetFlow();

  // Compute live badges
  const pendingApprovalCount =
    activeMeeting?.actionItems.filter((t) => t.approvalStatus === 'Pending').length || 0;
  const highRiskCount =
    activeMeeting?.risks.filter((r) => r.severity === 'Critical' || r.severity === 'High').length || 0;

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'upload',
      label: 'Upload & Analyze',
      icon: <FileUp className="w-5 h-5" />,
    },
    {
      id: 'action-register',
      label: 'Smart Action Register',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: activeMeeting?.actionItems.length,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'evidence-explorer',
      label: 'Evidence Explorer',
      icon: <Quote className="w-5 h-5" />,
    },
    {
      id: 'dependency-map',
      label: 'Dependency Graph',
      icon: <Network className="w-5 h-5" />,
    },
    {
      id: 'risk-center',
      label: 'Risk Center',
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: highRiskCount > 0 ? highRiskCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'approval-hub',
      label: 'Human Approval Hub',
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: pendingApprovalCount > 0 ? pendingApprovalCount : undefined,
      badgeColor: 'bg-purple-500/30 text-purple-200 border border-purple-400/30',
    },
    {
      id: 'team-accountability',
      label: 'Team Accountability',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'meeting-history',
      label: 'Meeting History & Audit',
      icon: <History className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setCurrentTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#090D1A] text-slate-200 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">MeetFlow</span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 leading-none mt-0.5">
                Meeting-to-Action Tracker
              </p>
            </div>
          </div>

          {/* Active Meeting Switcher */}
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            <label className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1.5">
              Current Active Meeting
            </label>
            <div className="relative">
              <select
                value={activeMeetingId}
                onChange={(e) => setActiveMeetingId(e.target.value)}
                className="w-full appearance-none bg-slate-900/90 text-slate-200 text-xs font-medium pl-3 pr-8 py-2 rounded-lg border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer truncate"
              >
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Platform Modules
          </div>
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    } transition-colors`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      active
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & demo reset */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          {/* AI engine badge */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping absolute opacity-75"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Gemini 3.8 Flash
                </p>
                <p className="text-[10px] text-slate-400">
                  {serverStatus.geminiConfigured ? 'Live Grounded AI' : 'Rule & Fallback Engine'}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Ready
            </span>
          </div>

          {/* Reset Demo button */}
          <button
            onClick={resetToDemo}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800 transition-colors"
            title="Reload official hackathon sample demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </aside>
    </>
  );
};
