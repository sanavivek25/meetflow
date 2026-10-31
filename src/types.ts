export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type RiskCategory =
  | 'Deadline'
  | 'Resource'
  | 'Communication'
  | 'Dependency'
  | 'Unassigned Ownership'
  | 'Technical'
  | 'Operational';

export type IntegrationPlatform =
  | 'Google Tasks'
  | 'Google Calendar'
  | 'Trello'
  | 'Slack'
  | 'Email';

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp?: string | null;
  lineNumber: number;
}

export interface EvidenceRef {
  quote: string;
  speaker?: string;
  timestamp?: string | null;
  segmentId?: string;
  lineNumber?: number;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  title: string;
  description: string;
  owner: string; // e.g. "Priya", "Sneha", "Arjun", or "Unassigned"
  team: string; // e.g. "Design", "Backend", "Frontend", "QA"
  dueDate: string; // "YYYY-MM-DD" or "Not specified"
  priority: PriorityLevel;
  status: TaskStatus;
  dependencies: string[]; // Task IDs like "TASK-101"
  risks: string[];
  confidence: number; // 0-100
  approvalStatus: ApprovalStatus;
  evidence: EvidenceRef;
  externalSync?: {
    syncedTo: IntegrationPlatform[];
    lastSyncPayload?: Record<string, any>;
    syncedAt?: string;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  meetingId: string;
  decision: string;
  impact?: string;
  evidence: EvidenceRef;
}

export interface RiskItem {
  id: string;
  meetingId: string;
  category: RiskCategory;
  severity: RiskSeverity;
  description: string;
  relatedTaskId?: string;
  recommendedMitigation: string;
  evidence: EvidenceRef;
  status: 'Open' | 'Mitigated' | 'Accepted';
}

export interface ClarificationItem {
  id: string;
  meetingId: string;
  question: string;
  context: string;
  suggestedAction: string;
  status: 'Open' | 'Resolved';
}

export interface Participant {
  name: string;
  role?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  meetingType: string;
  participants: Participant[];
  rawTranscript: string;
  segments: TranscriptSegment[];
  summary: string;
  keyDiscussionPoints: string[];
  decisions: Decision[];
  actionItems: ActionItem[];
  risks: RiskItem[];
  unresolvedQuestions: ClarificationItem[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action:
    | 'EXTRACTED'
    | 'EDITED'
    | 'APPROVED'
    | 'REJECTED'
    | 'SIMULATED_SYNC'
    | 'DELETED'
    | 'TASK_CREATED'
    | 'RISK_UPDATED';
  targetId: string;
  targetType: 'TASK' | 'MEETING' | 'INTEGRATION' | 'RISK';
  details: string;
  user: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'upload'
  | 'action-register'
  | 'evidence-explorer'
  | 'dependency-map'
  | 'risk-center'
  | 'approval-hub'
  | 'team-accountability'
  | 'meeting-history';
