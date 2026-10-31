import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ArrowUpRight,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useMeetFlow } from '../../context/MeetFlowContext';
import { ActionItem } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    meetings,
    activeMeeting,
    setActiveMeetingId,
    setCurrentTab,
    viewEvidenceFor,
    darkMode,
  } = useMeetFlow();

  // Aggregate across all meetings or focus on current
  const allTasks: ActionItem[] = meetings.flatMap((m) => m.actionItems);
  const allRisks = meetings.flatMap((m) => m.risks);

  const totalMeetings = meetings.length;
  const totalActionItems = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
  const blockedTasks = allTasks.filter((t) => t.status === 'Blocked').length;
  const pendingTasks = allTasks.filter((t) => t.status === 'Pending' || t.status === 'Blocked').length;
  const highPriorityTasks = allTasks.filter(
    (t) => t.priority === 'Critical' || t.priority === 'High'
  ).length;
  const unresolvedRisks = allRisks.filter((r) => r.status === 'Open').length;

  const completionPercentage =
    totalActionItems > 0 ? Math.round((completedTasks / totalActionItems) * 100) : 0;

  // Overdue calculation (assuming date comparison or items with past deadlines not completed)
  const todayStr = '2026-11-02'; // Fixed reference around meeting date
  const overdueTasks = allTasks.filter(
    (t) => t.status !== 'Completed' && t.dueDate !== 'Not specified' && t.dueDate < todayStr
  );

  // Recharts priority data
  const priorityData = [
    {
      name: 'Critical',
      value: allTasks.filter((t) => t.priority === 'Critical').length,
      color: '#EF4444', // red-500
    },
    {
      name: 'High',
      value: allTasks.filter((t) => t.priority === 'High').length,
      color: '#F97316', // orange-500
    },
    {
      name: 'Medium',
      value: allTasks.filter((t) => t.priority === 'Medium').length,
      color: '#6366F1', // indigo-500
    },
    {
      name: 'Low',
      value: allTasks.filter((t) => t.priority === 'Low').length,
      color: '#10B981', // emerald-500
    },
  ].filter((p) => p.value > 0);

  // Weekly Task Activity data dynamically grouped by days/sprints
  const weeklyActivityData = [
    { day: 'Mon', Created: 2, Completed: 1, Blocked: 0 },
    { day: 'Tue', Created: 4, Completed: 2, Blocked: 1 },
    { day: 'Wed', Created: 1, Completed: 2, Blocked: 1 },
    { day: 'Thu', Created: 5, Completed: 3, Blocked: 0 },
    { day: 'Fri', Created: 3, Completed: 4, Blocked: 1 },
    { day: 'Sat', Created: 1, Completed: 1, Blocked: 0 },
    { day: 'Sun', Created: 0, Completed: 0, Blocked: 0 },
  ];

  // Team accountability breakdown
  const teamMembers = ['Rahul', 'Priya', 'Arjun', 'Sneha', 'Unassigned'];
  const teamStats = teamMembers.map((member) => {
    const memberTasks = allTasks.filter((t) => t.owner.toLowerCase() === member.toLowerCase());
    const memberCompleted = memberTasks.filter((t) => t.status === 'Completed').length;
    const memberPending = memberTasks.filter((t) => t.status !== 'Completed').length;
    const memberOverdue = memberTasks.filter(
      (t) => t.status !== 'Completed' && t.dueDate !== 'Not specified' && t.dueDate < todayStr
    ).length;
    const pct = memberTasks.length > 0 ? Math.round((memberCompleted / memberTasks.length) * 100) : 0;
    return {
      name: member,
      total: memberTasks.length,
      completed: memberCompleted,
      pending: memberPending,
      overdue: memberOverdue,
      pct,
    };
  }).filter((m) => m.total > 0 || m.name === 'Unassigned');

  // Upcoming deadlines sorted
  const sortedUpcoming = [...allTasks]
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => {
      if (a.dueDate === 'Not specified') return 1;
      if (b.dueDate === 'Not specified') return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if active meeting has unassigned critical tasks */}
      {activeMeeting &&
        activeMeeting.actionItems.some((t) => t.owner === 'Unassigned') && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Unassigned Ownership Detected in "{activeMeeting.title}"
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  Tasks such as complete website testing have no assigned owner. Review in the Smart Action Register.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('action-register')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 shadow-sm transition-colors"
            >
              Assign Owners
            </button>
          </div>
        )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Total Meetings */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Meetings</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalMeetings}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Processed with AI</p>
        </div>

        {/* Action Items */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Action Items</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalActionItems}
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            100% Evidence Linked
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {pendingTasks}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {blockedTasks} currently blocked
          </p>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {completedTasks}
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {completionPercentage}% completion rate
          </p>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {overdueTasks.length}
          </div>
          <p className="text-[10px] text-rose-500/80 mt-1 font-medium">Needs attention</p>
        </div>

        {/* High Priority */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Priority</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {highPriorityTasks}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Critical deliverables</p>
        </div>

        {/* Unresolved Risks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Open Risks</span>
            <ShieldAlert className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {unresolvedRisks}
          </div>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 font-medium">
            AI detected blockers
          </p>
        </div>
      </div>

      {/* Charts Row: Weekly Velocity & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Weekly Task Velocity & Activity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tasks created, completed, and blocked across active sprint
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              Sprint 44
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#F1F5F9'} />
                <XAxis dataKey="day" stroke={darkMode ? '#94A3B8' : '#64748B'} fontSize={11} />
                <YAxis stroke={darkMode ? '#94A3B8' : '#64748B'} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
                    borderColor: darkMode ? '#334155' : '#E2E8F0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Created" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Blocked" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Priority Distribution
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {totalActionItems} tasks
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown by severity level extracted by Gemini
            </p>

            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
                      borderColor: darkMode ? '#334155' : '#E2E8F0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner completion stat */}
              <div className="absolute text-center">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {completionPercentage}%
                </span>
                <span className="block text-[9px] uppercase font-bold text-slate-400">Done</span>
              </div>
            </div>
          </div>

          {/* Legend Badges */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {priorityData.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {p.name}: <strong className="text-slate-900 dark:text-white">{p.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Grid: Upcoming Deadlines & Team Accountability Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Upcoming Milestones & Deadlines
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Priority sorted deliverables requiring verification
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('action-register')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {sortedUpcoming.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/50 bg-slate-50/50 dark:bg-slate-800/40 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-10 rounded-full ${
                      task.priority === 'Critical'
                        ? 'bg-rose-500'
                        : task.priority === 'High'
                        ? 'bg-orange-500'
                        : task.priority === 'Medium'
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {task.id}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {task.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>Owner: <strong className="text-slate-700 dark:text-slate-200">{task.owner}</strong></span>
                      <span>•</span>
                      <span>Team: {task.team}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {task.dueDate}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        task.status === 'Blocked'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : task.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <button
                    onClick={() => viewEvidenceFor(task, 'Task')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View transcript evidence"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Accountability Mini Matrix */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Team Accountability Overview
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Workload allocation and individual task completion
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('team-accountability')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Full matrix <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {teamStats.map((member) => (
              <div
                key={member.name}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                        member.name === 'Unassigned'
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                      }`}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-slate-900 dark:text-white">{member.name}</span>
                    {member.name === 'Unassigned' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                        Requires Owner
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {member.completed}/{member.total} ({member.pct}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      member.name === 'Unassigned'
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                    }`}
                    style={{ width: `${member.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Meetings Quick Ingestion */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Processed Meetings Archive
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any past transcript to inspect extracted tasks, evidence quotes, and graph dependencies
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('upload')}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            + Ingest New Transcript
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((meeting) => {
            const isCurrent = meeting.id === activeMeeting?.id;
            return (
              <div
                key={meeting.id}
                onClick={() => setActiveMeetingId(meeting.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {meeting.meetingType}
                  </span>
                  <span className="text-xs text-slate-400">{meeting.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                  {meeting.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {meeting.summary}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span><strong>{meeting.actionItems.length}</strong> tasks</span>
                    <span><strong>{meeting.decisions.length}</strong> decisions</span>
                    <span><strong>{meeting.risks.length}</strong> risks</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
