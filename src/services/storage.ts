import { Meeting, ActionItem, AuditLog, IntegrationPlatform } from '../types';
import { parseTranscriptSegments } from '../utils/transcriptParser';

const STORAGE_KEY_MEETINGS = 'meetflow_meetings_v2';
const STORAGE_KEY_ACTIVE_MEETING = 'meetflow_active_meeting_id_v2';
const STORAGE_KEY_AUDIT_LOGS = 'meetflow_audit_logs_v2';

export const SAMPLE_TRANSCRIPT_TITLE = "Website Development Planning";
export const SAMPLE_TRANSCRIPT_DATE = "2026-11-01";
export const SAMPLE_TRANSCRIPT_TYPE = "Sprint Planning";
export const SAMPLE_TRANSCRIPT_PARTICIPANTS = [
  { name: "Rahul", role: "Project Manager" },
  { name: "Priya", role: "UI Designer" },
  { name: "Arjun", role: "Frontend Developer" },
  { name: "Sneha", role: "Backend Developer" },
];

export const SAMPLE_TRANSCRIPT_TEXT = `Rahul: We need to complete the new website development by November 15.

Priya: I will complete the homepage and dashboard UI designs by November 5.

Arjun: I can start frontend development after receiving the approved UI designs.

Sneha: I will complete the login API and database integration by November 8.

Rahul: Arjun should complete the dashboard frontend by November 12.

Arjun: I need the API endpoints from Sneha before completing the dashboard integration.

Sneha: I will share the API documentation by November 9.

Rahul: We need to test the complete website before November 14.

Priya: We might face delays if the design approval takes longer than expected.

Rahul: Let's review the project progress in our next meeting.`;

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: "meet-demo-101",
    title: "Website Development Planning",
    date: "2026-11-01",
    meetingType: "Sprint Planning",
    participants: SAMPLE_TRANSCRIPT_PARTICIPANTS,
    rawTranscript: SAMPLE_TRANSCRIPT_TEXT,
    segments: parseTranscriptSegments(SAMPLE_TRANSCRIPT_TEXT),
    summary: "The engineering and design leads finalized the delivery schedule for the upcoming website development launch targeting November 15. Priya will deliver homepage and dashboard UI designs by November 5, Sneha will complete login API & database integration by November 8 and share API docs by November 9, and Arjun will build the dashboard frontend by November 12 once designs and APIs are ready. Testing is set for November 14.",
    keyDiscussionPoints: [
      "Target go-live milestone locked for November 15",
      "Sequential handoff from UI Design (Priya) to Frontend Dashboard (Arjun)",
      "Backend auth & database endpoints readiness (Sneha)",
      "Strict dependency chain between API documentation release and frontend integration",
      "Unassigned ownership identified for full-suite testing on November 14",
      "Identified critical risk of UI design approval bottlenecks"
    ],
    decisions: [
      {
        id: "DEC-001",
        meetingId: "meet-demo-101",
        decision: "Target completion date for the new website development is locked for November 15.",
        impact: "Establishes hard delivery timeline for all engineering and QA milestones.",
        evidence: {
          quote: "We need to complete the new website development by November 15.",
          speaker: "Rahul",
          timestamp: "00:01:10",
          segmentId: "seg-1",
          lineNumber: 1
        }
      },
      {
        id: "DEC-002",
        meetingId: "meet-demo-101",
        decision: "Project progress will be formally reviewed in the next scheduled sync.",
        impact: "Ensures ongoing sprint cadence and accountability.",
        evidence: {
          quote: "Let's review the project progress in our next meeting.",
          speaker: "Rahul",
          timestamp: "00:07:30",
          segmentId: "seg-10",
          lineNumber: 19
        }
      }
    ],
    actionItems: [
      {
        id: "TASK-101",
        meetingId: "meet-demo-101",
        meetingTitle: "Website Development Planning",
        title: "Complete homepage and dashboard UI designs",
        description: "Finalize high-fidelity Figma components, design tokens, and layout specs for homepage and dashboard views.",
        owner: "Priya",
        team: "Design",
        dueDate: "2026-11-05",
        priority: "High",
        status: "In Progress",
        dependencies: [],
        risks: ["Delay if stakeholder design approvals extend past deadline"],
        confidence: 96,
        approvalStatus: "Approved",
        evidence: {
          quote: "I will complete the homepage and dashboard UI designs by November 5.",
          speaker: "Priya",
          timestamp: "00:01:45",
          segmentId: "seg-2",
          lineNumber: 3
        },
        externalSync: {
          syncedTo: ["Trello", "Google Calendar"],
          syncedAt: "2026-11-01T10:30:00.000Z"
        },
        createdAt: "2026-11-01T09:00:00.000Z",
        updatedAt: "2026-11-01T10:30:00.000Z"
      },
      {
        id: "TASK-102",
        meetingId: "meet-demo-101",
        meetingTitle: "Website Development Planning",
        title: "Complete login API and database integration",
        description: "Implement user authentication endpoints, JWT token issuance, session refresh, and PostgreSQL schema mappings.",
        owner: "Sneha",
        team: "Backend",
        dueDate: "2026-11-08",
        priority: "High",
        status: "Pending",
        dependencies: [],
        risks: ["Third-party auth provider rate limits"],
        confidence: 94,
        approvalStatus: "Approved",
        evidence: {
          quote: "I will complete the login API and database integration by November 8.",
          speaker: "Sneha",
          timestamp: "00:03:00",
          segmentId: "seg-4",
          lineNumber: 7
        },
        externalSync: {
          syncedTo: ["Google Tasks"],
          syncedAt: "2026-11-01T10:35:00.000Z"
        },
        createdAt: "2026-11-01T09:00:00.000Z",
        updatedAt: "2026-11-01T10:35:00.000Z"
      },
      {
        id: "TASK-103",
        meetingId: "meet-demo-101",
        meetingTitle: "Website Development Planning",
        title: "Share API documentation with frontend team",
        description: "Publish Swagger/OpenAPI specs and mock responses for all dashboard and authentication endpoints.",
        owner: "Sneha",
        team: "Backend",
        dueDate: "2026-11-09",
        priority: "Medium",
        status: "Pending",
        dependencies: ["TASK-102"],
        risks: ["API contract modifications mid-sprint"],
        confidence: 93,
        approvalStatus: "Pending",
        evidence: {
          quote: "I will share the API documentation by November 9.",
          speaker: "Sneha",
          timestamp: "00:05:15",
          segmentId: "seg-7",
          lineNumber: 13
        },
        createdAt: "2026-11-01T09:00:00.000Z",
        updatedAt: "2026-11-01T09:00:00.000Z"
      },
      {
        id: "TASK-104",
        meetingId: "meet-demo-101",
        meetingTitle: "Website Development Planning",
        title: "Develop dashboard frontend",
        description: "Construct responsive client views, integrate state management, and bind to Sneha's API endpoints.",
        owner: "Arjun",
        team: "Frontend",
        dueDate: "2026-11-12",
        priority: "Critical",
        status: "Blocked",
        dependencies: ["TASK-101", "TASK-103"],
        risks: ["Hard dependency on Priya's UI design signoff and Sneha's API documentation"],
        confidence: 95,
        approvalStatus: "Pending",
        evidence: {
          quote: "Arjun should complete the dashboard frontend by November 12.",
          speaker: "Rahul",
          timestamp: "00:03:50",
          segmentId: "seg-5",
          lineNumber: 9
        },
        createdAt: "2026-11-01T09:00:00.000Z",
        updatedAt: "2026-11-01T09:00:00.000Z"
      },
      {
        id: "TASK-105",
        meetingId: "meet-demo-101",
        meetingTitle: "Website Development Planning",
        title: "Conduct comprehensive end-to-end website testing",
        description: "Perform cross-browser compatibility, regression tests, load verification, and mobile viewport checks before final rollout.",
        owner: "Unassigned",
        team: "QA / Testing",
        dueDate: "2026-11-14",
        priority: "Critical",
        status: "Pending",
        dependencies: ["TASK-104"],
        risks: ["No assigned QA resource or tester specified in transcript"],
        confidence: 89,
        approvalStatus: "Pending",
        evidence: {
          quote: "We need to test the complete website before November 14.",
          speaker: "Rahul",
          timestamp: "00:06:00",
          segmentId: "seg-8",
          lineNumber: 15
        },
        createdAt: "2026-11-01T09:00:00.000Z",
        updatedAt: "2026-11-01T09:00:00.000Z"
      }
    ],
    risks: [
      {
        id: "RISK-01",
        meetingId: "meet-demo-101",
        category: "Dependency",
        severity: "High",
        description: "Arjun's dashboard frontend delivery (Nov 12) is double-blocked on Priya's UI approval (Nov 5) and Sneha's API docs (Nov 9).",
        relatedTaskId: "TASK-104",
        recommendedMitigation: "Provide Arjun with mock JSON schemas immediately so frontend scaffolding starts in parallel.",
        evidence: {
          quote: "I need the API endpoints from Sneha before completing the dashboard integration.",
          speaker: "Arjun",
          segmentId: "seg-6",
          lineNumber: 11
        },
        status: "Open"
      },
      {
        id: "RISK-02",
        meetingId: "meet-demo-101",
        category: "Deadline",
        severity: "High",
        description: "Stakeholder UI design sign-off delays will push entire downstream frontend and testing schedules.",
        relatedTaskId: "TASK-101",
        recommendedMitigation: "Hold an expedited design review with executive approvers on November 4th.",
        evidence: {
          quote: "We might face delays if the design approval takes longer than expected.",
          speaker: "Priya",
          segmentId: "seg-9",
          lineNumber: 17
        },
        status: "Open"
      },
      {
        id: "RISK-03",
        meetingId: "meet-demo-101",
        category: "Unassigned Ownership",
        severity: "Critical",
        description: "Critical end-to-end testing deadline (November 14) has no designated owner assigned.",
        relatedTaskId: "TASK-105",
        recommendedMitigation: "Designate an owner (e.g., Rahul or joint developer test pair) in the Action Register.",
        evidence: {
          quote: "We need to test the complete website before November 14.",
          speaker: "Rahul",
          segmentId: "seg-8",
          lineNumber: 15
        },
        status: "Open"
      }
    ],
    unresolvedQuestions: [
      {
        id: "Q-01",
        meetingId: "meet-demo-101",
        question: "Who will execute the end-to-end website testing before November 14?",
        context: "Rahul stated 'We need to test the complete website before November 14' without delegating the task to a specific person.",
        suggestedAction: "Assign a QA owner or pair Arjun and Sneha for test execution.",
        status: "Open"
      },
      {
        id: "Q-02",
        meetingId: "meet-demo-101",
        question: "What is the contingency plan if design approval extends past November 5?",
        context: "Priya explicitly cautioned that design approval turnaround could cause cascading delays.",
        suggestedAction: "Approve a wireframe fallback baseline so frontend development is unblocked.",
        status: "Open"
      }
    ],
    createdAt: "2026-11-01T09:00:00.000Z"
  },
  {
    id: "meet-demo-102",
    title: "Mobile App Performance & Cloud Sync Sync",
    date: "2026-10-28",
    meetingType: "Architecture & Tech",
    participants: [
      { name: "Rahul", role: "Project Manager" },
      { name: "Sneha", role: "Backend Developer" },
      { name: "Arjun", role: "Frontend Developer" }
    ],
    rawTranscript: `Rahul: Let's discuss the cloud synchronization bottlenecks identified during stress testing.
Sneha: I implemented the Redis session store and optimized cache invalidation yesterday. It reduced latency by 45%.
Arjun: I finished optimizing the offline cache on the frontend mobile client. It's ready for testing.
Rahul: Great. Sneha, please prepare the performance benchmark report for our leadership sync by Friday.
Sneha: Understood, I will deliver the benchmark report by November 3.`,
    segments: parseTranscriptSegments(`Rahul: Let's discuss the cloud synchronization bottlenecks identified during stress testing.
Sneha: I implemented the Redis session store and optimized cache invalidation yesterday. It reduced latency by 45%.
Arjun: I finished optimizing the offline cache on the frontend mobile client. It's ready for testing.
Rahul: Great. Sneha, please prepare the performance benchmark report for our leadership sync by Friday.
Sneha: Understood, I will deliver the benchmark report by November 3.`),
    summary: "Sneha and Arjun reviewed mobile performance improvements. Redis caching reduced latency by 45% and offline frontend cache was deployed. Sneha will publish the formal benchmark report by November 3.",
    keyDiscussionPoints: [
      "Redis session caching achieved 45% latency improvement",
      "Offline cache deployed to mobile clients",
      "Benchmark reporting deadline set for November 3"
    ],
    decisions: [
      {
        id: "DEC-102-1",
        meetingId: "meet-demo-102",
        decision: "Standardize on Redis for distributed session caching across regions.",
        impact: "Reduces database connection pool exhaustion.",
        evidence: {
          quote: "I implemented the Redis session store and optimized cache invalidation yesterday. It reduced latency by 45%.",
          speaker: "Sneha",
          segmentId: "seg-2",
          lineNumber: 2
        }
      }
    ],
    actionItems: [
      {
        id: "TASK-201",
        meetingId: "meet-demo-102",
        meetingTitle: "Mobile App Performance & Cloud Sync Sync",
        title: "Optimize offline cache on frontend mobile client",
        description: "Implement SQLite cache warming and differential synchronization protocol.",
        owner: "Arjun",
        team: "Frontend",
        dueDate: "2026-10-30",
        priority: "High",
        status: "Completed",
        dependencies: [],
        risks: [],
        confidence: 98,
        approvalStatus: "Approved",
        evidence: {
          quote: "I finished optimizing the offline cache on the frontend mobile client. It's ready for testing.",
          speaker: "Arjun",
          segmentId: "seg-3",
          lineNumber: 3
        },
        externalSync: {
          syncedTo: ["Google Tasks", "Slack"],
          syncedAt: "2026-10-28T14:00:00.000Z"
        },
        createdAt: "2026-10-28T10:00:00.000Z",
        updatedAt: "2026-10-30T17:00:00.000Z"
      },
      {
        id: "TASK-202",
        meetingId: "meet-demo-102",
        meetingTitle: "Mobile App Performance & Cloud Sync Sync",
        title: "Prepare cloud sync performance benchmark report",
        description: "Compile latency distribution curves and memory profile graphs for leadership review.",
        owner: "Sneha",
        team: "Backend",
        dueDate: "2026-11-03",
        priority: "Medium",
        status: "In Progress",
        dependencies: [],
        risks: [],
        confidence: 94,
        approvalStatus: "Approved",
        evidence: {
          quote: "Understood, I will deliver the benchmark report by November 3.",
          speaker: "Sneha",
          segmentId: "seg-5",
          lineNumber: 5
        },
        externalSync: {
          syncedTo: ["Slack"],
          syncedAt: "2026-10-28T14:10:00.000Z"
        },
        createdAt: "2026-10-28T10:00:00.000Z",
        updatedAt: "2026-10-28T14:10:00.000Z"
      }
    ],
    risks: [],
    unresolvedQuestions: [],
    createdAt: "2026-10-28T10:00:00.000Z"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-11-01T09:05:00.000Z",
    action: "EXTRACTED",
    targetId: "meet-demo-101",
    targetType: "MEETING",
    details: "Extracted 5 action items, 2 decisions, 3 risks, and 2 clarification items from Website Development Planning transcript via Gemini 3.8 Flash.",
    user: "System (MeetFlow AI)"
  },
  {
    id: "log-2",
    timestamp: "2026-11-01T10:30:00.000Z",
    action: "APPROVED",
    targetId: "TASK-101",
    targetType: "TASK",
    details: "Human approval granted for TASK-101 (Complete homepage and dashboard UI designs) assigned to Priya.",
    user: "Rahul (Project Lead)"
  },
  {
    id: "log-3",
    timestamp: "2026-11-01T10:31:00.000Z",
    action: "SIMULATED_SYNC",
    targetId: "TASK-101",
    targetType: "INTEGRATION",
    details: "Dispatched payload to simulated Trello board ('Engineering Sprint Q4') and Google Calendar.",
    user: "Rahul (Project Lead)"
  },
  {
    id: "log-4",
    timestamp: "2026-11-01T10:35:00.000Z",
    action: "APPROVED",
    targetId: "TASK-102",
    targetType: "TASK",
    details: "Human approval granted for TASK-102 (Complete login API and database integration) assigned to Sneha.",
    user: "Rahul (Project Lead)"
  }
];

// Storage Helper Functions
export function loadMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEETINGS);
    if (!raw) {
      saveMeetings(INITIAL_MEETINGS);
      return INITIAL_MEETINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse meetings from storage, resetting to demo data', e);
    return INITIAL_MEETINGS;
  }
}

export function saveMeetings(meetings: Meeting[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(meetings));
  } catch (e) {
    console.error('Failed to save meetings to storage', e);
  }
}

export function getActiveMeetingId(): string {
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_MEETING);
    return active || 'meet-demo-101';
  } catch {
    return 'meet-demo-101';
  }
}

export function setActiveMeetingId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_MEETING, id);
  } catch (e) {
    console.error('Failed to set active meeting id', e);
  }
}

export function loadAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    if (!raw) {
      saveAuditLogs(INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveAuditLogs(logs: AuditLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save audit logs', e);
  }
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
  const logs = loadAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  saveAuditLogs(logs.slice(0, 100)); // keep last 100
}

// Reset data to initial demo state
export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(INITIAL_MEETINGS));
  localStorage.setItem(STORAGE_KEY_ACTIVE_MEETING, 'meet-demo-101');
  localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
}
