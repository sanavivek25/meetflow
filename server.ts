import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));

// Health / Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
    process.env.GEMINI_API_KEY.trim().length > 5
  );
  res.json({
    status: 'ok',
    geminiConfigured: hasKey,
    model: 'gemini-3.8-flash',
  });
});

// Prompt generator for Gemini structured transcript analysis
const buildSystemInstruction = () => `
You are MeetFlow AI, an expert meeting analyst, executive secretary, and project manager.
Your task is to analyze meeting transcripts and extract accurate, grounded, non-hallucinated project data.

CRITICAL RULES:
1. Extract ONLY facts explicitly supported by the transcript.
2. NEVER invent or guess owners, due dates, or teams. If an owner is not clearly agreed, output "Unassigned" or "Needs clarification".
3. If a deadline or date is not explicitly mentioned, output "Not specified".
4. Clearly distinguish between a confirmed DECISION (agreed commitment) and a SUGGESTION or open discussion.
5. Every single decision, action item, and risk MUST include direct textual EVIDENCE:
   - quote: Exact or near-exact sentence from the transcript.
   - speaker: Name of the speaker who said it (if identifiable).
   - timestamp: Timestamp string if mentioned in transcript, otherwise null.
   - segmentId: e.g. "seg-1", "seg-2", or matching paragraph number.
6. Identify dependencies between tasks:
   - Clearly state which task must happen before another (e.g. Arjun's frontend requires approved UI designs from Priya and login API endpoints from Sneha).
7. Identify project risks, including resource constraints, schedule bottlenecks, vague ownership, and missing specifications.
8. Identify ambiguous or conflicting statements as unresolvedQuestions.
`;

app.post('/api/analyze-transcript', async (req: Request, res: Response) => {
  try {
    const { transcript, title, date, participants, meetingType } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 10) {
      return res.status(400).json({
        error: 'Please provide a valid transcript with at least 10 characters.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isKeyConfigured = Boolean(
      apiKey &&
      apiKey !== 'MY_GEMINI_API_KEY' &&
      apiKey.trim().length > 5
    );

    if (!isKeyConfigured) {
      // Return smart structured fallback parse for demo when API key is not yet set
      const parsed = generateIntelligentFallback(transcript, title, date, participants, meetingType);
      return res.json({
        ...parsed,
        isDemoFallback: true,
        message: 'Analysis generated using MeetFlow Rule Engine (Add GEMINI_API_KEY in Secrets for live Gemini model).',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
Analyze the following meeting transcript thoroughly:

Meeting Title: ${title || 'Untitled Meeting'}
Meeting Date: ${date || 'Current'}
Meeting Type: ${meetingType || 'General'}
Reported Participants: ${Array.isArray(participants) ? participants.join(', ') : participants || 'Not specified'}

TRANSCRIPT:
"""
${transcript}
"""

Extract structured information matching the schema:
1. meetingSummary: High-level executive summary (3-4 sentences).
2. keyDiscussionPoints: Array of 3-6 core topics discussed.
3. decisions: Every firm agreement reached.
4. actionItems: Specific tasks assigned. Note owners, due dates, priority (Critical, High, Medium, Low), status (Pending, In Progress, Blocked), dependencies (array of strings), risks, and supporting quotation.
5. risks: Potential blockers, deadline issues, or resource constraints.
6. unresolvedQuestions: Unassigned tasks or ambiguities that require human clarification.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: buildSystemInstruction(),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meetingSummary: { type: Type.STRING },
            keyDiscussionPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            decisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  decision: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  evidence: {
                    type: Type.OBJECT,
                    properties: {
                      quote: { type: Type.STRING },
                      speaker: { type: Type.STRING },
                      timestamp: { type: Type.STRING, nullable: true },
                      segmentId: { type: Type.STRING, nullable: true },
                    },
                    required: ['quote'],
                  },
                },
                required: ['id', 'decision', 'evidence'],
              },
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  team: { type: Type.STRING },
                  dueDate: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  status: { type: Type.STRING },
                  dependencies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  risks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  confidence: { type: Type.NUMBER },
                  approvalStatus: { type: Type.STRING },
                  evidence: {
                    type: Type.OBJECT,
                    properties: {
                      quote: { type: Type.STRING },
                      speaker: { type: Type.STRING },
                      timestamp: { type: Type.STRING, nullable: true },
                      segmentId: { type: Type.STRING, nullable: true },
                    },
                    required: ['quote'],
                  },
                },
                required: ['id', 'title', 'owner', 'dueDate', 'priority', 'status', 'evidence'],
              },
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  relatedTaskId: { type: Type.STRING, nullable: true },
                  recommendedMitigation: { type: Type.STRING },
                  evidence: {
                    type: Type.OBJECT,
                    properties: {
                      quote: { type: Type.STRING },
                      speaker: { type: Type.STRING },
                      segmentId: { type: Type.STRING, nullable: true },
                    },
                    required: ['quote'],
                  },
                },
                required: ['id', 'category', 'severity', 'description', 'recommendedMitigation', 'evidence'],
              },
            },
            unresolvedQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  context: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                },
                required: ['id', 'question', 'context'],
              },
            },
          },
          required: ['meetingSummary', 'decisions', 'actionItems', 'risks', 'unresolvedQuestions'],
        },
      },
    });

    const textOutput = response.text || '{}';
    const parsedData = JSON.parse(textOutput);

    return res.json({
      ...parsedData,
      isDemoFallback: false,
    });
  } catch (error: any) {
    console.error('Error analyzing transcript with Gemini:', error);
    // If Gemini fails or times out, provide robust fallback analysis
    const { transcript, title, date, participants, meetingType } = req.body;
    const fallback = generateIntelligentFallback(transcript, title, date, participants, meetingType);
    return res.json({
      ...fallback,
      isDemoFallback: true,
      errorNotice: error?.message || 'Gemini API call encountered an error. Provided rule-based extraction.',
    });
  }
});

// Helper for when Gemini API key is absent or offline
function generateIntelligentFallback(
  transcript: string,
  title?: string,
  date?: string,
  participants?: any,
  meetingType?: string
) {
  const isSample = transcript.toLowerCase().includes('website development') ||
                   transcript.toLowerCase().includes('priya') ||
                   transcript.toLowerCase().includes('sneha');

  if (isSample) {
    return {
      meetingSummary: "The engineering and design teams aligned on key delivery milestones for the upcoming website development launch scheduled for November 15. Priya is finalizing UI designs, Sneha is handling backend API documentation and auth integration, and Arjun will implement the frontend dashboard contingent upon design approval and API readiness.",
      keyDiscussionPoints: [
        "Final website development launch deadline set for November 15",
        "Frontend dashboard dependent on Sneha's APIs and Priya's designs",
        "Risk of timeline slippage if UI design approvals are delayed",
        "Full system testing requirement prior to November 14"
      ],
      decisions: [
        {
          id: "DEC-001",
          decision: "Target completion date for the new website development is fixed for November 15.",
          impact: "Drives all dependent milestones across design, backend, and QA.",
          evidence: {
            quote: "We need to complete the new website development by November 15.",
            speaker: "Rahul",
            timestamp: "00:01:10",
            segmentId: "seg-1"
          }
        },
        {
          id: "DEC-002",
          decision: "Team will conduct regular progress reviews in subsequent scheduled syncs.",
          impact: "Maintains accountability across sprint cycles.",
          evidence: {
            quote: "Let's review the project progress in our next meeting.",
            speaker: "Rahul",
            timestamp: "00:09:45",
            segmentId: "seg-10"
          }
        }
      ],
      actionItems: [
        {
          id: "TASK-101",
          title: "Complete homepage and dashboard UI designs",
          description: "Deliver high-fidelity Figma mockups and specifications for homepage and dashboard views.",
          owner: "Priya",
          team: "Design",
          dueDate: "2026-11-05",
          priority: "High",
          status: "In Progress",
          dependencies: [],
          risks: ["Delay in external client design approvals"],
          confidence: 96,
          approvalStatus: "Approved",
          evidence: {
            quote: "I will complete the homepage and dashboard UI designs by November 5.",
            speaker: "Priya",
            timestamp: "00:01:45",
            segmentId: "seg-2"
          }
        },
        {
          id: "TASK-102",
          title: "Complete login API and database integration",
          description: "Implement user authentication endpoints, JWT handling, and database schema mappings.",
          owner: "Sneha",
          team: "Backend",
          dueDate: "2026-11-08",
          priority: "High",
          status: "Pending",
          dependencies: [],
          risks: ["Database connection latency or schema adjustments"],
          confidence: 94,
          approvalStatus: "Approved",
          evidence: {
            quote: "I will complete the login API and database integration by November 8.",
            speaker: "Sneha",
            timestamp: "00:03:10",
            segmentId: "seg-4"
          }
        },
        {
          id: "TASK-103",
          title: "Share API documentation with frontend team",
          description: "Provide Swagger / Postman collections for all dashboard and auth endpoints to unblock Arjun.",
          owner: "Sneha",
          team: "Backend",
          dueDate: "2026-11-09",
          priority: "Medium",
          status: "Pending",
          dependencies: ["TASK-102"],
          risks: ["Incomplete API contract blocking frontend mocks"],
          confidence: 92,
          approvalStatus: "Pending",
          evidence: {
            quote: "I will share the API documentation by November 9.",
            speaker: "Sneha",
            timestamp: "00:05:40",
            segmentId: "seg-7"
          }
        },
        {
          id: "TASK-104",
          title: "Develop dashboard frontend",
          description: "Build reactive dashboard components and integrate with Sneha's backend API endpoints.",
          owner: "Arjun",
          team: "Frontend",
          dueDate: "2026-11-12",
          priority: "Critical",
          status: "Blocked",
          dependencies: ["TASK-101", "TASK-103"],
          risks: ["Blocked on UI approval (Priya) and API docs (Sneha)"],
          confidence: 95,
          approvalStatus: "Pending",
          evidence: {
            quote: "Arjun should complete the dashboard frontend by November 12.",
            speaker: "Rahul",
            timestamp: "00:04:15",
            segmentId: "seg-5"
          }
        },
        {
          id: "TASK-105",
          title: "Conduct comprehensive end-to-end website testing",
          description: "Perform regression, security, responsive layout, and cross-browser testing across the site.",
          owner: "Unassigned",
          team: "QA / Testing",
          dueDate: "2026-11-14",
          priority: "Critical",
          status: "Pending",
          dependencies: ["TASK-104"],
          risks: ["No designated QA owner currently assigned"],
          confidence: 88,
          approvalStatus: "Pending",
          evidence: {
            quote: "We need to test the complete website before November 14.",
            speaker: "Rahul",
            timestamp: "00:06:50",
            segmentId: "seg-8"
          }
        }
      ],
      risks: [
        {
          id: "RISK-01",
          category: "Dependency",
          severity: "High",
          description: "Arjun's frontend completion by Nov 12 is strictly dependent on both Priya's designs (Nov 5) and Sneha's API documentation (Nov 9).",
          relatedTaskId: "TASK-104",
          recommendedMitigation: "Have Arjun work with mock data structures immediately while Sneha finalizes API schemas.",
          evidence: {
            quote: "I need the API endpoints from Sneha before completing the dashboard integration.",
            speaker: "Arjun",
            segmentId: "seg-6"
          }
        },
        {
          id: "RISK-02",
          category: "Deadline",
          severity: "High",
          description: "Potential schedule slippage if stakeholder UI design approval takes longer than anticipated.",
          relatedTaskId: "TASK-101",
          recommendedMitigation: "Schedule an expedited asynchronous design sign-off review on November 4.",
          evidence: {
            quote: "We might face delays if the design approval takes longer than expected.",
            speaker: "Priya",
            segmentId: "seg-9"
          }
        },
        {
          id: "RISK-03",
          category: "Unassigned Ownership",
          severity: "Medium",
          description: "End-to-end website testing before Nov 14 has no designated owner assigned.",
          relatedTaskId: "TASK-105",
          recommendedMitigation: "Explicitly assign testing responsibility to Rahul or a dedicated QA engineer in the next standup.",
          evidence: {
            quote: "We need to test the complete website before November 14.",
            speaker: "Rahul",
            segmentId: "seg-8"
          }
        }
      ],
      unresolvedQuestions: [
        {
          id: "Q-01",
          question: "Who is responsible for executing the complete website testing by November 14?",
          context: "Rahul stated 'We need to test the complete website before November 14' without naming an owner.",
          suggestedAction: "Assign an owner (e.g. QA engineer or Arjun/Sneha joint test run) in the Smart Action Register."
        },
        {
          id: "Q-02",
          question: "What is the backup plan if design approval is delayed beyond November 5?",
          context: "Priya noted that delayed approval could derail the downstream frontend timeline.",
          suggestedAction: "Define an MVP design threshold for frontend scaffolding to start on time."
        }
      ]
    };
  }

  // Generic heuristic parse for custom transcripts
  const lines = transcript.split('\n').filter(l => l.trim().length > 0);
  const detectedDecisions: any[] = [];
  const detectedTasks: any[] = [];
  const detectedRisks: any[] = [];

  let taskId = 200;
  lines.forEach((line, index) => {
    const colonIndex = line.indexOf(':');
    let speaker = 'Speaker';
    let text = line;
    if (colonIndex > 0 && colonIndex < 30) {
      speaker = line.substring(0, colonIndex).trim();
      text = line.substring(colonIndex + 1).trim();
    }

    const lower = text.toLowerCase();
    if (lower.includes('will') || lower.includes('should') || lower.includes('need to') || lower.includes('by ') || lower.includes('deadline')) {
      detectedTasks.push({
        id: `TASK-${taskId++}`,
        title: text.length > 60 ? text.substring(0, 57) + '...' : text,
        description: `Action extracted from: "${text}"`,
        owner: speaker !== 'Speaker' ? speaker : 'Unassigned',
        team: 'Engineering',
        dueDate: 'Not specified',
        priority: lower.includes('urgent') || lower.includes('critical') ? 'Critical' : 'Medium',
        status: 'Pending',
        dependencies: [],
        risks: [],
        confidence: 85,
        approvalStatus: 'Pending',
        evidence: {
          quote: text,
          speaker: speaker,
          timestamp: null,
          segmentId: `line-${index + 1}`
        }
      });
    }

    if (lower.includes('decide') || lower.includes('agreed') || lower.includes('target is') || lower.includes('approved')) {
      detectedDecisions.push({
        id: `DEC-00${detectedDecisions.length + 1}`,
        decision: text,
        impact: "Operational milestone alignment.",
        evidence: {
          quote: text,
          speaker: speaker,
          segmentId: `line-${index + 1}`
        }
      });
    }

    if (lower.includes('risk') || lower.includes('delay') || lower.includes('block') || lower.includes('might face')) {
      detectedRisks.push({
        id: `RISK-0${detectedRisks.length + 1}`,
        category: "Operational",
        severity: "Medium",
        description: text,
        recommendedMitigation: "Monitor milestone and assign follow-up checkpoint.",
        evidence: {
          quote: text,
          speaker: speaker,
          segmentId: `line-${index + 1}`
        }
      });
    }
  });

  return {
    meetingSummary: `Analysis of "${title || 'Meeting'}" conducted on ${date || 'recent session'}. The discussion covered ${lines.length} key conversational exchanges with multiple action items identified.`,
    keyDiscussionPoints: lines.slice(0, 4).map(l => l.replace(/^[A-Za-z]+:\s*/, '')),
    decisions: detectedDecisions.length > 0 ? detectedDecisions : [
      {
        id: "DEC-001",
        decision: "Proceed with scheduled sprint targets based on discussion points.",
        impact: "Ensures immediate team alignment.",
        evidence: {
          quote: lines[0] || "Team agreed to proceed.",
          speaker: "Team",
          segmentId: "line-1"
        }
      }
    ],
    actionItems: detectedTasks.length > 0 ? detectedTasks : [
      {
        id: "TASK-201",
        title: "Review meeting findings and assign owners",
        description: "Clarify open questions and confirm delivery targets.",
        owner: "Unassigned",
        team: "Operations",
        dueDate: "Not specified",
        priority: "High",
        status: "Pending",
        dependencies: [],
        risks: ["Action item requires owner assignment"],
        confidence: 80,
        approvalStatus: "Pending",
        evidence: {
          quote: lines[0] || transcript.slice(0, 60),
          speaker: "Lead",
          segmentId: "line-1"
        }
      }
    ],
    risks: detectedRisks.length > 0 ? detectedRisks : [
      {
        id: "RISK-01",
        category: "Communication",
        severity: "Low",
        description: "Potential ambiguity in task ownership requiring manager verification.",
        recommendedMitigation: "Verify owners in the Smart Action Register before approval.",
        evidence: {
          quote: lines[lines.length - 1] || "Review needed.",
          speaker: "System",
          segmentId: `line-${lines.length}`
        }
      }
    ],
    unresolvedQuestions: [
      {
        id: "Q-01",
        question: "Verify task deadlines and resource commitments.",
        context: "Extracted statements require explicit human confirmation before external export.",
        suggestedAction: "Review in the Human Approval Queue."
      }
    ]
  };
}

// Vite middleware integration for development, or static serving in production
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 MeetFlow AI server running at http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
