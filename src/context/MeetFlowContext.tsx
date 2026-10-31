import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Meeting,
  ActionItem,
  AuditLog,
  NavigationTab,
  Decision,
  RiskItem,
  IntegrationPlatform,
} from '../types';
import {
  loadMeetings,
  saveMeetings,
  getActiveMeetingId,
  setActiveMeetingId as persistActiveMeetingId,
  loadAuditLogs,
  addAuditLog,
  resetDemoData,
} from '../services/storage';
import { checkServerStatus } from '../services/api';

export interface EvidenceFocus {
  quote: string;
  segmentId?: string;
  speaker?: string;
  sourceTitle?: string;
  sourceType: 'Task' | 'Decision' | 'Risk';
  sourceId: string;
  item: any;
}

interface MeetFlowContextType {
  meetings: Meeting[];
  activeMeeting: Meeting | undefined;
  activeMeetingId: string;
  auditLogs: AuditLog[];
  currentTab: NavigationTab;
  darkMode: boolean;
  serverStatus: { geminiConfigured: boolean; model: string };
  selectedEvidence: EvidenceFocus | null;
  globalSearchOpen: boolean;
  toastMessage: { id: string; type: 'success' | 'error' | 'info'; text: string } | null;

  setCurrentTab: (tab: NavigationTab) => void;
  setActiveMeetingId: (id: string) => void;
  toggleDarkMode: () => void;
  setGlobalSearchOpen: (open: boolean) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;

  updateTask: (task: ActionItem) => void;
  deleteTask: (taskId: string) => void;
  createTask: (newTask: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  approveTask: (taskId: string) => void;
  rejectTask: (taskId: string, reason?: string) => void;
  bulkApproveTasks: (taskIds: string[]) => void;
  simulateIntegrationSync: (taskId: string, platform: IntegrationPlatform) => void;

  updateRisk: (risk: RiskItem) => void;
  resolveClarification: (id: string) => void;
  addMeeting: (meeting: Meeting) => void;
  deleteMeeting: (meetingId: string) => void;
  resetToDemo: () => void;
  viewEvidenceFor: (item: any, type: 'Task' | 'Decision' | 'Risk') => void;
  clearSelectedEvidence: () => void;
}

const MeetFlowContext = createContext<MeetFlowContextType | undefined>(undefined);

export const MeetFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(loadMeetings());
  const [activeMeetingId, setActiveIdState] = useState<string>(getActiveMeetingId());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(loadAuditLogs());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('meetflow_theme') === 'dark';
  });
  const [serverStatus, setServerStatus] = useState<{ geminiConfigured: boolean; model: string }>({
    geminiConfigured: false,
    model: 'gemini-3.8-flash',
  });
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceFocus | null>(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    id: string;
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Load server status
  useEffect(() => {
    checkServerStatus().then((status) => {
      setServerStatus(status);
    });
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('meetflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('meetflow_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ id: String(Date.now()), type, text });
  };

  const activeMeeting = meetings.find((m) => m.id === activeMeetingId) || meetings[0];

  const handleSetActiveMeetingId = (id: string) => {
    setActiveIdState(id);
    persistActiveMeetingId(id);
  };

  const updateMeetingsAndPersist = (updated: Meeting[]) => {
    setMeetings(updated);
    saveMeetings(updated);
  };

  const refreshAuditLogs = () => {
    setAuditLogs(loadAuditLogs());
  };

  // Task operations
  const updateTask = (updatedTask: ActionItem) => {
    const updatedMeetings = meetings.map((m) => {
      if (m.id !== updatedTask.meetingId) return m;
      return {
        ...m,
        actionItems: m.actionItems.map((t) =>
          t.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date().toISOString() } : t
        ),
      };
    });
    updateMeetingsAndPersist(updatedMeetings);
    addAuditLog({
      action: 'EDITED',
      targetId: updatedTask.id,
      targetType: 'TASK',
      details: `Updated task "${updatedTask.title}" (Owner: ${updatedTask.owner}, Due: ${updatedTask.dueDate}, Priority: ${updatedTask.priority})`,
      user: 'Rahul (Project Lead)',
    });
    refreshAuditLogs();
    showToast(`Task ${updatedTask.id} updated successfully`);
  };

  const deleteTask = (taskId: string) => {
    let deletedTitle = '';
    const updatedMeetings = meetings.map((m) => {
      const found = m.actionItems.find((t) => t.id === taskId);
      if (found) deletedTitle = found.title;
      return {
        ...m,
        actionItems: m.actionItems.filter((t) => t.id !== taskId),
      };
    });
    updateMeetingsAndPersist(updatedMeetings);
    addAuditLog({
      action: 'DELETED',
      targetId: taskId,
      targetType: 'TASK',
      details: `Deleted task ${taskId} ("${deletedTitle}")`,
      user: 'Rahul (Project Lead)',
    });
    refreshAuditLogs();
    showToast(`Task ${taskId} removed`, 'info');
  };

  const createTask = (newTaskData: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `TASK-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    const newTask: ActionItem = {
      ...newTaskData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    const targetMeetingId = newTask.meetingId || activeMeetingId;
    const updatedMeetings = meetings.map((m) => {
      if (m.id !== targetMeetingId) return m;
      return {
        ...m,
        actionItems: [newTask, ...m.actionItems],
      };
    });

    updateMeetingsAndPersist(updatedMeetings);
    addAuditLog({
      action: 'TASK_CREATED',
      targetId: newId,
      targetType: 'TASK',
      details: `Created new action item "${newTask.title}" assigned to ${newTask.owner}`,
      user: 'Rahul (Project Lead)',
    });
    refreshAuditLogs();
    showToast(`Created task ${newId}`);
  };

  const approveTask = (taskId: string) => {
    let taskName = '';
    const updatedMeetings = meetings.map((m) => {
      return {
        ...m,
        actionItems: m.actionItems.map((t) => {
          if (t.id === taskId) {
            taskName = t.title;
            return {
              ...t,
              approvalStatus: 'Approved' as const,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        }),
      };
    });
    updateMeetingsAndPersist(updatedMeetings);
    addAuditLog({
      action: 'APPROVED',
      targetId: taskId,
      targetType: 'TASK',
      details: `Human verification approved for task ${taskId}: "${taskName}"`,
      user: 'Rahul (Project Lead)',
    });
    refreshAuditLogs();
    showToast(`Approved ${taskId}`);
  };

  const rejectTask = (taskId: string, reason?: string) => {
    let taskName = '';
    const updatedMeetings = meetings.map((m) => {
      return {
        ...m,
        actionItems: m.actionItems.map((t) => {
          if (t.id === taskId) {
            taskName = t.title;
            return {
              ...t,
              approvalStatus: 'Rejected' as const,
              rejectionReason: reason || 'Information does not match meeting intent or needs revision',
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        }),
      };
    });
    updateMeetingsAndPersist(updatedMeetings);
    addAuditLog({
      action: 'REJECTED',
      targetId: taskId,
      targetType: 'TASK',
      details: `Rejected task ${taskId}: "${taskName}". Reason: ${reason || 'Needs revision'}`,
      user: 'Rahul (Project Lead)',
    });
    refreshAuditLogs();
    showToast(`Task ${taskId} marked as Rejected`, 'info');
  };

  const bulkApproveTasks = (taskIds: string[]) => {
    if (taskIds.length === 0) return;
    const idSet = new Set(taskIds);
    const updatedMeetings = meetings.map((m) => {
      return {
        ...m,
        actionItems: m.actionItems.map((t) => {
          if (idSet.has(t.id)) {
            return {
              ...t,
              approvalStatus: 'Approved' as const,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        }),
      };
    });
    updateMeetingsAndPersist(updatedMeetings);
    addAuditLog({
      action: 'APPROVED',
      targetId: taskIds.join(', '),
      targetType: 'TASK',
      details: `Batch human approval granted for ${taskIds.length} tasks (${taskIds.join(', ')})`,
      user: 'Rahul (Project Lead)',
    });
    refreshAuditLogs();
    showToast(`Bulk approved ${taskIds.length} tasks`);
  };

  const simulateIntegrationSync = (taskId: string, platform: IntegrationPlatform) => {
    let taskName = '';
    const updatedMeetings = meetings.map((m) => {
      return {
        ...m,
        actionItems: m.actionItems.map((t) => {
          if (t.id === taskId) {
            taskName = t.title;
            const currentSyncs = t.externalSync?.syncedTo || [];
            const syncedTo = Array.from(new Set([...currentSyncs, platform]));
            return {
              ...t,
              externalSync: {
                syncedTo,
                lastSyncPayload: {
                  taskTitle: t.title,
                  owner: t.owner,
                  deadline: t.dueDate,
                  priority: t.priority,
                  sourceMeeting: m.title,
                  syncedAt: new Date().toISOString(),
                },
                syncedAt: new Date().toISOString(),
              },
            };
          }
          return t;
        }),
      };
    });

    updateMeetingsAndPersist(updatedMeetings);
    addAuditLog({
      action: 'SIMULATED_SYNC',
      targetId: taskId,
      targetType: 'INTEGRATION',
      details: `Dispatched approved task ${taskId} ("${taskName}") to simulated ${platform} integration.`,
      user: 'Rahul (Project Lead)',
    });
    refreshAuditLogs();
    showToast(`Successfully synced to ${platform}`);
  };

  const updateRisk = (updatedRisk: RiskItem) => {
    const updatedMeetings = meetings.map((m) => {
      if (m.id !== updatedRisk.meetingId) return m;
      return {
        ...m,
        risks: m.risks.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)),
      };
    });
    updateMeetingsAndPersist(updatedMeetings);
    addAuditLog({
      action: 'RISK_UPDATED',
      targetId: updatedRisk.id,
      targetType: 'RISK',
      details: `Risk ${updatedRisk.id} status set to ${updatedRisk.status}`,
      user: 'Rahul (Project Lead)',
    });
    refreshAuditLogs();
    showToast(`Risk ${updatedRisk.id} updated`);
  };

  const resolveClarification = (id: string) => {
    const updatedMeetings = meetings.map((m) => {
      return {
        ...m,
        unresolvedQuestions: m.unresolvedQuestions.map((q) =>
          q.id === id ? { ...q, status: 'Resolved' as const } : q
        ),
      };
    });
    updateMeetingsAndPersist(updatedMeetings);
    showToast('Question marked as resolved');
  };

  const addMeeting = (newMeeting: Meeting) => {
    const updated = [newMeeting, ...meetings];
    updateMeetingsAndPersist(updated);
    handleSetActiveMeetingId(newMeeting.id);
    addAuditLog({
      action: 'EXTRACTED',
      targetId: newMeeting.id,
      targetType: 'MEETING',
      details: `Analyzed and stored meeting "${newMeeting.title}" with ${newMeeting.actionItems.length} action items.`,
      user: 'MeetFlow AI Engine',
    });
    refreshAuditLogs();
    setCurrentTab('dashboard');
    showToast(`Meeting "${newMeeting.title}" analyzed and added!`);
  };

  const deleteMeeting = (meetingId: string) => {
    if (meetings.length <= 1) {
      showToast('Cannot delete the last remaining meeting', 'error');
      return;
    }
    const updated = meetings.filter((m) => m.id !== meetingId);
    updateMeetingsAndPersist(updated);
    if (activeMeetingId === meetingId) {
      handleSetActiveMeetingId(updated[0].id);
    }
    showToast('Meeting deleted', 'info');
  };

  const resetToDemo = () => {
    resetDemoData();
    const demoMeetings = loadMeetings();
    setMeetings(demoMeetings);
    setActiveIdState('meet-demo-101');
    setAuditLogs(loadAuditLogs());
    showToast('Demo data reloaded to original state');
  };

  const viewEvidenceFor = (item: any, type: 'Task' | 'Decision' | 'Risk') => {
    if (!item || !item.evidence) {
      showToast('No transcript evidence link available for this item', 'error');
      return;
    }
    setSelectedEvidence({
      quote: item.evidence.quote,
      segmentId: item.evidence.segmentId,
      speaker: item.evidence.speaker,
      sourceTitle: item.title || item.decision || item.description,
      sourceType: type,
      sourceId: item.id,
      item,
    });
    setCurrentTab('evidence-explorer');
  };

  const clearSelectedEvidence = () => {
    setSelectedEvidence(null);
  };

  return (
    <MeetFlowContext.Provider
      value={{
        meetings,
        activeMeeting,
        activeMeetingId,
        auditLogs,
        currentTab,
        darkMode,
        serverStatus,
        selectedEvidence,
        globalSearchOpen,
        toastMessage,

        setCurrentTab,
        setActiveMeetingId: handleSetActiveMeetingId,
        toggleDarkMode,
        setGlobalSearchOpen,
        showToast,

        updateTask,
        deleteTask,
        createTask,
        approveTask,
        rejectTask,
        bulkApproveTasks,
        simulateIntegrationSync,

        updateRisk,
        resolveClarification,
        addMeeting,
        deleteMeeting,
        resetToDemo,
        viewEvidenceFor,
        clearSelectedEvidence,
      }}
    >
      {children}
    </MeetFlowContext.Provider>
  );
};

export const useMeetFlow = () => {
  const context = useContext(MeetFlowContext);
  if (!context) {
    throw new Error('useMeetFlow must be used within a MeetFlowProvider');
  }
  return context;
};
